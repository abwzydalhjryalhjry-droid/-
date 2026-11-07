import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { buildSystemForDevice, BuiltPcSystem } from './pcBuilder';
import { disposeCachedTextures } from './proceduralTextures';
import { createDataFlowSystem, DataFlowSystem } from './dataFlowSystem';
import { LaptopSimulationSystem, SimulationStepData } from './laptopSimulation';
import { HARDWARE_COMPONENTS, ASSEMBLY_SEQUENCE, CAMERA_PRESETS, DEVICE_CONFIGS } from '../data/componentsData';
import { ComponentId, HardwareComponentId, FanSpeedMode, ScreenMarker, DeviceType } from '../types';

export interface SceneCallbacks {
  onComponentSelect: (id: ComponentId | null) => void;
  onExplodeChange: (factor: number) => void;
  onScreenMarkersUpdate?: (markers: ScreenMarker[]) => void;
  onAssemblyStepComplete?: (id: ComponentId) => void;
  onCinematicStep?: (id: ComponentId) => void;
  onLaptopStepChange?: (step: SimulationStepData) => void;
}

export class SceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  public pcSystem: BuiltPcSystem;
  public dataFlowSystem: DataFlowSystem;
  public laptopSimulation: LaptopSimulationSystem;
  private callbacks: SceneCallbacks;

  // Active Device Form Factor & Pre-warmed System Cache
  public currentDevice: DeviceType = 'desktop';
  private cachedSystems = new Map<DeviceType, BuiltPcSystem>();

  // UI Dirty-checking: Prevents DOM thrashing when camera/explode are still
  private lastCameraPosition = new THREE.Vector3();
  private lastCameraQuaternion = new THREE.Quaternion();
  private lastMarkerExplodeFactor = -1;
  public markersNeedUpdate = true;

  private isDisposed = false;
  private animationFrameId = 0;
  private clock = new THREE.Clock();

  // Exploded view state
  public explodeFactor = 0.0;
  public targetExplodeFactor = 0.0;
  public isAutoExploding = false;
  private autoExplodeDirection = 1;

  // Assembly guide state
  public isAssemblyMode = false;
  public currentAssemblyStep = 1;
  public installedComponents = new Set<ComponentId>(ASSEMBLY_SEQUENCE);

  // Data flow simulation state
  public isDataFlowActive = true;

  // Cinematic Mode state
  public isCinematicMode = false;
  private cinematicTimer = 0;
  private cinematicIndex = 0;
  private cinematicSequence: ComponentId[] = [
    'cpu',
    'ram',
    'gpu',
    'ssd',
    'motherboard',
    'psu',
    'case',
    'internet',
  ];

  // System power state
  public isPoweredOn = true;
  private currentFanSpeed = 0.14;
  private targetFanSpeed = 0.14;

  // Fan speed multiplier
  public fanSpeedMultiplier = 0.14;

  // X-Ray mode
  public isXRayMode = false;

  // Camera animation
  private targetCameraPos = new THREE.Vector3(28, 22, 32);
  private targetControlsTarget = new THREE.Vector3(0, 0, 0);
  private isCameraTransitioning = false;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public hoveredComponentId: ComponentId | null = null;
  public selectedComponentId: ComponentId | null = null;

  // Initial rest positions
  private basePositions = new Map<THREE.Object3D, THREE.Vector3>();
  private componentExplodeProgress = new Map<ComponentId, number>();

  // Glowing 3D Target Marker (Ring) for Guided Mode
  private guideTargetRing: THREE.Mesh;

  // Performance & Marker Direct-DOM Optimization
  public isPerformanceMode = false;
  public showNumbers = true;
  private markerDomElements: Map<ComponentId, HTMLElement> | null = null;
  private tempMarkerPos = new THREE.Vector3();
  private lastReportedExplode = -1;

  // Tour mode
  public isTourActive = false;
  private tourIndex = 0;
  private tourTimer = 0;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Renderer Setup (High Performance Profile)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Fog Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080d);
    this.scene.fog = new THREE.FogExp2(0x06080d, 0.007);

    // 3. Camera Setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    this.camera.position.set(28, 22, 32);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 120;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.target.set(0, 0, 0);

    this.controls.addEventListener('start', () => {
      this.isCameraTransitioning = false;
      if (this.isCinematicMode) {
        // Pauses cinematic auto-fly if user touches camera
      }
    });

    // 5. Studio Environment Map (PMREM)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 6. Lighting Rig
    this.setupLighting();

    // 7. Ground Grid & Contact Shadow
    this.setupGround();

    // 8. Build Procedural PC Model & Cache for Instant 60 FPS Switching
    this.pcSystem = buildSystemForDevice(this.currentDevice);
    this.cachedSystems.set(this.currentDevice, this.pcSystem);
    this.scene.add(this.pcSystem.rootGroup);

    // Save base rest positions
    this.rebindComponentPositions();

    // 9. Build Data Flow System & Holographic Globe
    this.dataFlowSystem = createDataFlowSystem();
    this.scene.add(this.dataFlowSystem.rootGroup);

    // 10. Create 3D Guided Target Ring
    const ringGeo = new THREE.TorusGeometry(3.2, 0.12, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.85,
    });
    this.guideTargetRing = new THREE.Mesh(ringGeo, ringMat);
    this.guideTargetRing.visible = false;
    this.guideTargetRing.rotation.x = Math.PI / 2;
    this.scene.add(this.guideTargetRing);

    // 11. Laptop Live Simulation System
    this.laptopSimulation = new LaptopSimulationSystem(this.scene);
    this.laptopSimulation.onStepChange = (data) => this.callbacks.onLaptopStepChange?.(data);
    this.laptopSimulation.rootGroup.visible = this.currentDevice === 'laptop';

    // 12. Event Listeners
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onKeyDown);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('click', this.onPointerClick);

    // 13. Start Loop
    this.tick();
  }

  private setupLighting() {
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.4);
    keyLight.position.set(35, 45, 30);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.02;
    // Bounded frustum to concentrate shadow map resolution on the chassis
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 120;
    keyLight.shadow.camera.left = -28;
    keyLight.shadow.camera.right = 28;
    keyLight.shadow.camera.top = 28;
    keyLight.shadow.camera.bottom = -28;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7928ca, 0x05070a, 1.2);
    this.scene.add(hemiLight);

    const cyanRim = new THREE.DirectionalLight(0x00f0ff, 2.8);
    cyanRim.position.set(-35, 20, -35);
    this.scene.add(cyanRim);

    const violetPoint = new THREE.PointLight(0x9d00ff, 3.5, 45);
    violetPoint.position.set(12, -4, 18);
    this.scene.add(violetPoint);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 2.5, 35);
    cyanPoint.position.set(-2, 8, 4);
    this.scene.add(cyanPoint);

    // Globe accent light
    const globeLight = new THREE.PointLight(0x00f0ff, 3.0, 30);
    globeLight.position.set(22, 18, -14);
    this.scene.add(globeLight);
  }

  private setupGround() {
    const floorSize = 140;
    const gridHelper = new THREE.GridHelper(floorSize, 40, 0x00f0ff, 0x141a29);
    gridHelper.position.y = -20.2;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    this.scene.add(gridHelper);

    const shadowGeo = new THREE.PlaneGeometry(60, 60);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.y = -20.15;
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
  }

  private onWindowResize = () => {
    if (this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.markersNeedUpdate = true;
  };

  private onPointerMove = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = [
      ...this.pcSystem.rootGroup.children,
      this.dataFlowSystem.globeGroup,
    ];
    const intersects = this.raycaster.intersectObjects(targets, true);

    // Laptop specific interactive keyboard & trackpad raycasting
    if (this.currentDevice === 'laptop') {
      let keyHit: THREE.Mesh | null = null;
      for (const hit of intersects) {
        if (hit.object.userData?.isLaptopKey) {
          keyHit = hit.object as THREE.Mesh;
          break;
        } else if (hit.object.userData?.isLaptopTrackpad) {
          const localPoint = hit.object.worldToLocal(hit.point.clone());
          const nx = localPoint.x / 3.3; // -1 to 1
          const ny = -localPoint.z / 2.2; // -1 to 1
          this.laptopSimulation.handleTrackpadPointer(nx, ny);
        }
      }
      this.laptopSimulation.handleKeyHover(keyHit);
      if (keyHit) {
        this.container.style.cursor = 'pointer';
        return;
      }
    }

    let foundId: ComponentId | null = null;
    for (const hit of intersects) {
      if (hit.object.userData?.componentId) {
        foundId = hit.object.userData.componentId;
        break;
      }
    }

    if (this.hoveredComponentId !== foundId) {
      this.hoveredComponentId = foundId;
      this.container.style.cursor = foundId ? 'pointer' : 'default';
    }
  };

  private onPointerClick = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = [
      ...this.pcSystem.rootGroup.children,
      this.dataFlowSystem.globeGroup,
    ];
    const intersects = this.raycaster.intersectObjects(targets, true);

    // Laptop 3D Keypress click
    if (this.currentDevice === 'laptop') {
      for (const hit of intersects) {
        if (hit.object.userData?.isLaptopKey) {
          const char = hit.object.userData.keyChar as string;
          this.laptopSimulation.triggerKeystroke(char);
          return;
        }
      }
    }

    let clickedId: ComponentId | null = null;
    for (const hit of intersects) {
      if (hit.object.userData?.componentId) {
        clickedId = hit.object.userData.componentId;
        break;
      }
    }

    if (clickedId) {
      this.selectComponent(clickedId);
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.isDisposed || this.currentDevice !== 'laptop') return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === ' ' || e.key.startsWith('Arrow')) {
      e.preventDefault();
    }
    let char = e.key;
    if (e.key === ' ') char = 'SPACE';
    else if (e.key === 'Enter') char = 'ENTER';
    else if (e.key === 'Backspace') char = 'BACKSPACE';
    else if (e.key === 'Delete') char = 'DEL';
    else if (e.key === 'ArrowLeft') char = 'LEFT';
    else if (e.key === 'ArrowRight') char = 'RIGHT';
    else if (e.key === 'ArrowUp') char = 'UP';
    else if (e.key === 'ArrowDown') char = 'DOWN';
    else if (e.key.length === 1) char = e.key.toUpperCase();

    this.laptopSimulation.triggerKeystroke(char);
  };

  public selectComponent(id: ComponentId | null) {
    this.selectedComponentId = id;
    this.callbacks.onComponentSelect(id);

    if (id === 'internet') {
      const globeCenter = new THREE.Vector3(22, 14, -14);
      this.focusCameraOn(globeCenter, 14);
      this.dataFlowSystem.triggerPacketBurst();
      return;
    }

    if (id && HARDWARE_COMPONENTS[id]) {
      const targetGroup = this.pcSystem.componentGroups[id as HardwareComponentId];
      if (targetGroup) {
        const box = new THREE.Box3().setFromObject(targetGroup);
        const center = box.getCenter(new THREE.Vector3());
        this.focusCameraOn(center, 18);
        this.flashComponentHighlight(id, 0x00f0ff);
      }
    }
  }

  public flashComponentHighlight(id: ComponentId, colorHex = 0x00f0ff) {
    if (id === 'internet') {
      this.dataFlowSystem.triggerPacketBurst();
      return;
    }

    const group = this.pcSystem.componentGroups[id as HardwareComponentId];
    if (!group) return;

    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if ('emissive' in mat) {
          const originalEmissive = mat.emissive.clone();
          const originalIntensity = mat.emissiveIntensity;

          gsap.to(mat.emissive, {
            r: (colorHex >> 16 & 255) / 255,
            g: (colorHex >> 8 & 255) / 255,
            b: (colorHex & 255) / 255,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => {
              mat.emissive.copy(originalEmissive);
              mat.emissiveIntensity = originalIntensity;
            },
          });
          gsap.to(mat, {
            emissiveIntensity: 3.5,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
          });
        }
      }
    });
  }

  public focusCameraOn(targetPos: THREE.Vector3, distance = 22) {
    this.targetControlsTarget.copy(targetPos);
    this.targetCameraPos.set(
      targetPos.x + distance * 0.9,
      targetPos.y + distance * 0.6,
      targetPos.z + distance * 0.9
    );
    this.isCameraTransitioning = true;
  }

  public setCameraPreset(presetId: string) {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    this.targetCameraPos.set(...preset.position);
    this.targetControlsTarget.set(...preset.target);
    this.isCameraTransitioning = true;
    this.isTourActive = false;
    this.isCinematicMode = false;
  }

  public setExplode(factor: number) {
    this.targetExplodeFactor = Math.max(0, Math.min(1, factor));
    this.isAutoExploding = false;
    this.markersNeedUpdate = true;

    Object.keys(HARDWARE_COMPONENTS).forEach((key) => {
      if (key !== 'internet') {
        this.componentExplodeProgress.set(key as ComponentId, this.targetExplodeFactor);
      }
    });
  }

  public toggleAutoExplode() {
    this.isAutoExploding = !this.isAutoExploding;
  }

  public rebindComponentPositions() {
    this.basePositions.clear();
    this.componentExplodeProgress.clear();
    Object.entries(this.pcSystem.componentGroups).forEach(([id, group]) => {
      if (group) {
        this.basePositions.set(group, group.position.clone());
        this.componentExplodeProgress.set(id as ComponentId, 0.0);
      }
    });
    if (this.pcSystem.glassPanel) {
      this.basePositions.set(
        this.pcSystem.glassPanel,
        this.pcSystem.glassPanel.position.clone()
      );
    }
  }

  public setDevice(deviceType: DeviceType, duration = 0.5) {
    if (this.currentDevice === deviceType) return;
    this.currentDevice = deviceType;

    const oldSystem = this.pcSystem;
    const oldRoot = oldSystem.rootGroup;

    // Smooth exit transition of current model
    gsap.to(oldRoot.scale, {
      x: 0.01,
      y: 0.01,
      z: 0.01,
      duration: duration * 0.45,
      ease: 'power2.in',
      onComplete: () => {
        // Hide inactive model to conserve CPU and skip updates
        oldRoot.visible = false;

        // Retrieve from cache or build lazily and cache
        let newSystem = this.cachedSystems.get(deviceType);
        if (!newSystem) {
          newSystem = buildSystemForDevice(deviceType);
          this.cachedSystems.set(deviceType, newSystem);
          this.scene.add(newSystem.rootGroup);
        }

        this.pcSystem = newSystem;
        this.pcSystem.rootGroup.visible = true;
        this.pcSystem.rootGroup.scale.set(0.01, 0.01, 0.01);

        // Rebind positions
        this.rebindComponentPositions();

        // Apply current X-ray state
        if (this.isXRayMode) {
          this.pcSystem.allMaterials.forEach((mat) => {
            if ('wireframe' in mat) mat.wireframe = true;
          });
        }

        // Reset explosion state on switch
        this.explodeFactor = 0.0;
        this.targetExplodeFactor = 0.0;
        this.callbacks.onExplodeChange(0.0);
        this.markersNeedUpdate = true;

        // Animate entrance of new model
        gsap.to(this.pcSystem.rootGroup.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: duration * 0.55,
          ease: 'back.out(1.4)',
        });

        // Adapt camera settings based on device dimensions
        const config = DEVICE_CONFIGS[deviceType];
        if (config) {
          this.controls.minDistance = config.cameraDefault.minDistance;
          this.controls.maxDistance = config.cameraDefault.maxDistance;
          this.targetCameraPos.set(...config.cameraDefault.position);
          this.targetControlsTarget.set(...config.cameraDefault.target);
          this.isCameraTransitioning = true;
        }

        // Reset selection
        this.selectedComponentId = null;
        this.callbacks.onComponentSelect(null);

        // Reset installed components for the new device
        const sequence = config ? config.assemblySequence : ASSEMBLY_SEQUENCE;
        this.installedComponents = new Set(sequence);

        // Laptop Live Simulation activation & component linkage
        if (deviceType === 'laptop') {
          this.laptopSimulation.rootGroup.visible = true;
          if (
            this.pcSystem.screenMesh &&
            this.pcSystem.cpuDieMesh &&
            this.pcSystem.ramMesh &&
            this.pcSystem.trackpadMesh &&
            this.pcSystem.laptopKeys
          ) {
            this.laptopSimulation.registerComponents({
              screenMesh: this.pcSystem.screenMesh,
              cpuDie: this.pcSystem.cpuDieMesh,
              ram: this.pcSystem.ramMesh,
              trackpad: this.pcSystem.trackpadMesh,
              fans: this.pcSystem.animatedFans,
              keys: this.pcSystem.laptopKeys,
            });
          }
        } else {
          this.laptopSimulation.rootGroup.visible = false;
        }
      },
    });
  }

  public assembleAll(duration = 1.6) {
    this.isAutoExploding = false;
    this.targetExplodeFactor = 0.0;
    const sequence = DEVICE_CONFIGS[this.currentDevice]?.assemblySequence || ASSEMBLY_SEQUENCE;

    const obj = { val: this.explodeFactor };
    gsap.to(obj, {
      val: 0.0,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.explodeFactor = obj.val;
        this.targetExplodeFactor = obj.val;
        Object.keys(HARDWARE_COMPONENTS).forEach((key) => {
          if (key !== 'internet') {
            this.componentExplodeProgress.set(key as ComponentId, obj.val);
          }
        });
        this.callbacks.onExplodeChange(obj.val);
      },
      onComplete: () => {
        this.installedComponents = new Set(sequence);
        this.flashComponentHighlight('cpu', 0x10b981);
        if (this.pcSystem.componentGroups.gpu) {
          this.flashComponentHighlight('gpu', 0x10b981);
        }
      },
    });
  }

  public disassembleAll(duration = 1.6) {
    this.isAutoExploding = false;
    this.targetExplodeFactor = 1.0;

    const obj = { val: this.explodeFactor };
    gsap.to(obj, {
      val: 1.0,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.explodeFactor = obj.val;
        this.targetExplodeFactor = obj.val;
        Object.keys(HARDWARE_COMPONENTS).forEach((key) => {
          if (key !== 'internet') {
            this.componentExplodeProgress.set(key as ComponentId, obj.val);
          }
        });
        this.callbacks.onExplodeChange(obj.val);
      },
    });
  }

  public assembleStep(stepNumber: number) {
    const sequence = DEVICE_CONFIGS[this.currentDevice]?.assemblySequence || ASSEMBLY_SEQUENCE;
    const compId = sequence[stepNumber - 1];
    if (!compId) return;

    this.selectComponent(compId);

    const currentProgress = this.componentExplodeProgress.get(compId) ?? 1.0;
    const progressObj = { p: currentProgress };

    gsap.to(progressObj, {
      p: 0.0,
      duration: 1.2,
      ease: 'back.out(1.4)',
      onUpdate: () => {
        this.componentExplodeProgress.set(compId, progressObj.p);
      },
      onComplete: () => {
        this.installedComponents.add(compId);
        this.flashComponentHighlight(compId, 0x10b981);
        this.callbacks.onAssemblyStepComplete?.(compId);
      },
    });
  }

  public disassembleStep(stepNumber: number) {
    const sequence = DEVICE_CONFIGS[this.currentDevice]?.assemblySequence || ASSEMBLY_SEQUENCE;
    const compId = sequence[stepNumber - 1];
    if (!compId) return;

    const progressObj = { p: this.componentExplodeProgress.get(compId) ?? 0.0 };
    gsap.to(progressObj, {
      p: 1.0,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.componentExplodeProgress.set(compId, progressObj.p);
      },
      onComplete: () => {
        this.installedComponents.delete(compId);
      },
    });
  }

  public togglePower() {
    this.isPoweredOn = !this.isPoweredOn;
    this.targetFanSpeed = this.isPoweredOn ? this.fanSpeedMultiplier : 0.0;

    if (this.isPoweredOn) {
      this.flashComponentHighlight('motherboard', 0x00f0ff);
      this.flashComponentHighlight('cpu', 0x9d00ff);
    }
  }

  public toggleDataFlow() {
    this.isDataFlowActive = !this.isDataFlowActive;
  }

  // Cinematic Director Mode
  public toggleCinematicMode() {
    this.isCinematicMode = !this.isCinematicMode;
    if (this.isCinematicMode) {
      this.cinematicIndex = 0;
      this.cinematicTimer = 0;
      this.targetExplodeFactor = 0.55;
      this.stepCinematic();
    }
  }

  public stepCinematic() {
    if (!this.isCinematicMode) return;
    const compId = this.cinematicSequence[this.cinematicIndex];
    this.selectComponent(compId);
    this.callbacks.onCinematicStep?.(compId);
  }

  public toggleXRay() {
    this.isXRayMode = !this.isXRayMode;
    this.pcSystem.allMaterials.forEach((mat) => {
      if ('wireframe' in mat) {
        mat.wireframe = this.isXRayMode;
      }
    });
  }

  public setFanSpeed(mode: FanSpeedMode) {
    switch (mode) {
      case 'silent':
        this.fanSpeedMultiplier = 0.05;
        break;
      case 'balanced':
        this.fanSpeedMultiplier = 0.14;
        break;
      case 'turbo':
        this.fanSpeedMultiplier = 0.32;
        break;
    }
    if (this.isPoweredOn) {
      this.targetFanSpeed = this.fanSpeedMultiplier;
    }
  }

  public registerMarkerElements(map: Map<ComponentId, HTMLElement>) {
    this.markerDomElements = map;
    this.markersNeedUpdate = true;
  }

  public setShowNumbers(show: boolean) {
    this.showNumbers = show;
    this.markersNeedUpdate = true;
    if (!show && this.markerDomElements) {
      this.markerDomElements.forEach((el) => {
        el.style.display = 'none';
      });
    }
  }

  public setPerformanceMode(enabled: boolean) {
    this.isPerformanceMode = enabled;
    if (enabled) {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      this.renderer.shadowMap.enabled = true;
    }
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
  }

  public toggleTour() {
    this.isTourActive = !this.isTourActive;
    if (this.isTourActive) {
      this.tourIndex = 0;
      this.tourTimer = 0;
      this.stepTour();
    }
  }

  private stepTour() {
    if (!this.isTourActive) return;
    const sequence = DEVICE_CONFIGS[this.currentDevice]?.assemblySequence || ASSEMBLY_SEQUENCE;
    const compId = sequence[this.tourIndex % sequence.length];
    this.selectComponent(compId);
    this.targetExplodeFactor = 0.75;
  }

  private updateScreenMarkers() {
    if (!this.showNumbers) return;

    // UI Dirty check: avoid redundant projection math & DOM style mutations if camera and explode are stationary
    const camPos = this.camera.position;
    const camQuat = this.camera.quaternion;
    const posChanged = camPos.distanceToSquared(this.lastCameraPosition) > 0.0001;
    const rotChanged =
      Math.abs(camQuat.x - this.lastCameraQuaternion.x) > 0.0001 ||
      Math.abs(camQuat.y - this.lastCameraQuaternion.y) > 0.0001 ||
      Math.abs(camQuat.z - this.lastCameraQuaternion.z) > 0.0001 ||
      Math.abs(camQuat.w - this.lastCameraQuaternion.w) > 0.0001;
    const explodeChanged = Math.abs(this.explodeFactor - this.lastMarkerExplodeFactor) > 0.0005;

    if (
      !posChanged &&
      !rotChanged &&
      !explodeChanged &&
      !this.markersNeedUpdate &&
      !this.isCameraTransitioning &&
      !this.isCinematicMode
    ) {
      return;
    }

    this.lastCameraPosition.copy(camPos);
    this.lastCameraQuaternion.copy(camQuat);
    this.lastMarkerExplodeFactor = this.explodeFactor;
    this.markersNeedUpdate = false;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const sequence = DEVICE_CONFIGS[this.currentDevice]?.assemblySequence || ASSEMBLY_SEQUENCE;
    const sequenceSet = new Set<string>(sequence);

    // Direct DOM fast path: ZERO Box3 traversals, ZERO garbage generation
    if (this.markerDomElements) {
      // Hide any marker not part of the active device sequence
      this.markerDomElements.forEach((el, id) => {
        if (id !== 'internet' && !sequenceSet.has(id)) {
          if (el.style.display !== 'none') el.style.display = 'none';
        }
      });

      for (let index = 0; index < sequence.length; index++) {
        const id = sequence[index];
        const el = this.markerDomElements.get(id);
        if (!el) continue;

        const spec = HARDWARE_COMPONENTS[id];
        if (!spec) continue;

        const factor = this.componentExplodeProgress.get(id) ?? this.explodeFactor;
        const ox = spec.centerOffset ? spec.centerOffset[0] : 0;
        const oy = spec.centerOffset ? spec.centerOffset[1] : 0;
        const oz = spec.centerOffset ? spec.centerOffset[2] : 0;

        this.tempMarkerPos.set(
          ox + spec.explodedOffset[0] * factor,
          oy + spec.explodedOffset[1] * factor,
          oz + spec.explodedOffset[2] * factor
        );

        const isCurrentStep = this.isAssemblyMode && this.currentAssemblyStep === index + 1;
        if (isCurrentStep) {
          this.guideTargetRing.visible = true;
          this.guideTargetRing.position.set(
            this.tempMarkerPos.x,
            this.tempMarkerPos.y + 0.5,
            this.tempMarkerPos.z
          );
        }

        this.tempMarkerPos.project(this.camera);

        if (this.tempMarkerPos.z > 1.0) {
          if (el.style.display !== 'none') el.style.display = 'none';
        } else {
          if (el.style.display !== 'block') el.style.display = 'block';
          const sx = ((this.tempMarkerPos.x + 1) * width) / 2;
          const sy = ((-this.tempMarkerPos.y + 1) * height) / 2;
          el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
        }
      }

      // Internet Globe direct DOM marker
      const internetEl = this.markerDomElements.get('internet');
      if (internetEl) {
        this.tempMarkerPos.set(22, 14, -14);
        this.tempMarkerPos.project(this.camera);
        if (this.tempMarkerPos.z > 1.0) {
          if (internetEl.style.display !== 'none') internetEl.style.display = 'none';
        } else {
          if (internetEl.style.display !== 'block') internetEl.style.display = 'block';
          const sx = ((this.tempMarkerPos.x + 1) * width) / 2;
          const sy = ((-this.tempMarkerPos.y + 1) * height) / 2;
          internetEl.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
        }
      }

      if (!this.isAssemblyMode) {
        this.guideTargetRing.visible = false;
      }
      return;
    }

    if (!this.isAssemblyMode) {
      this.guideTargetRing.visible = false;
    }
  }

  private tick = () => {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.tick);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Auto Explode Oscillating Transition
    if (this.isAutoExploding) {
      this.targetExplodeFactor += this.autoExplodeDirection * delta * 0.35;
      if (this.targetExplodeFactor >= 1.0) {
        this.targetExplodeFactor = 1.0;
        this.autoExplodeDirection = -1;
      } else if (this.targetExplodeFactor <= 0.0) {
        this.targetExplodeFactor = 0.0;
        this.autoExplodeDirection = 1;
      }
      this.markersNeedUpdate = true;
      Object.keys(HARDWARE_COMPONENTS).forEach((key) => {
        if (key !== 'internet') {
          this.componentExplodeProgress.set(key as ComponentId, this.targetExplodeFactor);
        }
      });
    }

    this.explodeFactor = THREE.MathUtils.damp(
      this.explodeFactor,
      this.targetExplodeFactor,
      6.0,
      delta
    );

    // Throttle React state change to avoid 60fps React virtual DOM reconciliation
    if (Math.abs(this.explodeFactor - this.lastReportedExplode) > 0.005) {
      this.lastReportedExplode = this.explodeFactor;
      this.callbacks.onExplodeChange(this.explodeFactor);
    }

    // Apply individual component exploded offsets
    Object.entries(this.pcSystem.componentGroups).forEach(([id, group]) => {
      if (!group) return;
      const spec = HARDWARE_COMPONENTS[id as ComponentId];
      const basePos = this.basePositions.get(group);
      const factor = this.componentExplodeProgress.get(id as ComponentId) ?? this.explodeFactor;

      if (spec && basePos) {
        group.position.x = basePos.x + spec.explodedOffset[0] * factor;
        group.position.y = basePos.y + spec.explodedOffset[1] * factor;
        group.position.z = basePos.z + spec.explodedOffset[2] * factor;
      }
    });

    if (this.pcSystem.glassPanel) {
      const glassBase = this.basePositions.get(this.pcSystem.glassPanel);
      const caseFactor = this.componentExplodeProgress.get('case') ?? this.explodeFactor;
      if (glassBase) {
        this.pcSystem.glassPanel.position.x = glassBase.x + 18.0 * caseFactor;
      }
    }

    // 2. Data Flow & Globe Animation
    this.dataFlowSystem.update(delta, this.isDataFlowActive, this.isPoweredOn);

    // 2.1 Laptop Live Simulation & Keystroke Pipeline
    if (this.currentDevice === 'laptop') {
      this.laptopSimulation.update(delta);
    }

    // 3. Smooth Fan Rotation and deceleration when powered off
    this.currentFanSpeed = THREE.MathUtils.damp(
      this.currentFanSpeed,
      this.targetFanSpeed,
      2.5,
      delta
    );
    if (this.currentFanSpeed > 0.001) {
      this.pcSystem.animatedFans.forEach((rotor) => {
        rotor.rotation.z += this.currentFanSpeed;
      });
    }

    // 4. Pulse Emissive Motherboard Circuit Traces
    if (this.isPoweredOn) {
      const pulseIntensity = 1.2 + Math.sin(elapsedTime * 3.5) * 0.45;
      this.pcSystem.emissiveMaterials.forEach((mat) => {
        mat.emissiveIntensity = pulseIntensity;
      });
    } else {
      this.pcSystem.emissiveMaterials.forEach((mat) => {
        mat.emissiveIntensity = 0.25;
      });
    }

    // 5. Guided Mode Target Ring Pulse
    if (this.guideTargetRing.visible) {
      const ringScale = 1.0 + Math.sin(elapsedTime * 6.0) * 0.15;
      this.guideTargetRing.scale.set(ringScale, ringScale, ringScale);
      this.guideTargetRing.rotation.z += delta * 1.5;
    }

    // 6. Smooth Camera Transitions & Cinematic Orbit
    if (this.isCameraTransitioning) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.controls.target.lerp(this.targetControlsTarget, 0.06);
      if (
        this.camera.position.distanceTo(this.targetCameraPos) < 0.1 &&
        this.controls.target.distanceTo(this.targetControlsTarget) < 0.1
      ) {
        this.isCameraTransitioning = false;
      }
    } else if (this.isCinematicMode) {
      // Gentle cinematic orbit panning
      this.camera.position.x += Math.sin(elapsedTime * 0.4) * 0.06;
      this.camera.position.z += Math.cos(elapsedTime * 0.4) * 0.06;
    }

    // 7. Tour Timing
    if (this.isTourActive) {
      this.tourTimer += delta;
      if (this.tourTimer >= 5.0) {
        this.tourTimer = 0;
        this.tourIndex = (this.tourIndex + 1) % ASSEMBLY_SEQUENCE.length;
        this.stepTour();
      }
    }

    // 8. Cinematic Mode Timing
    if (this.isCinematicMode) {
      this.cinematicTimer += delta;
      if (this.cinematicTimer >= 6.5) {
        this.cinematicTimer = 0;
        this.cinematicIndex = (this.cinematicIndex + 1) % this.cinematicSequence.length;
        this.stepCinematic();
      }
    }

    // 9. Update 3D Number Markers Screen Projection
    this.updateScreenMarkers();

    // 10. Update Controls & Render
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private disposeSingleMaterial(mat: THREE.Material) {
    const anyMat = mat as unknown as Record<string, unknown>;
    for (const key of Object.keys(anyMat)) {
      const val = anyMat[key];
      if (val && typeof val === 'object' && 'isTexture' in val && typeof (val as THREE.Texture).dispose === 'function') {
        (val as THREE.Texture).dispose();
      }
    }
    mat.dispose();
  }

  private disposeObjectHierarchy(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => this.disposeSingleMaterial(m));
          } else {
            this.disposeSingleMaterial(child.material);
          }
        }
      }
    });
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDown);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('click', this.onPointerClick);

    // Dispose laptop simulation
    this.laptopSimulation.dispose();

    // Dispose all cached device systems, geometries, materials & textures
    this.cachedSystems.forEach((sys) => {
      this.disposeObjectHierarchy(sys.rootGroup);
      this.scene.remove(sys.rootGroup);
    });
    this.cachedSystems.clear();

    // Dispose shared procedural textures
    disposeCachedTextures();

    // Dispose target ring
    if (this.guideTargetRing) {
      this.guideTargetRing.geometry.dispose();
      (this.guideTargetRing.material as THREE.Material).dispose();
      this.scene.remove(this.guideTargetRing);
    }

    this.dataFlowSystem.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
