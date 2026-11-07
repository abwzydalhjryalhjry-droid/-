import * as THREE from 'three';
import gsap from 'gsap';

export interface SimulationStepData {
  step: 'idle' | 'keypress' | 'bus' | 'processing' | 'display';
  stepNumber: number;
  keyChar: string;
  stageTitleAr: string;
  stageDescAr: string;
  hardwareStage: string;
  latencyMs: number;
}

export class LaptopSimulationSystem {
  public rootGroup: THREE.Group;
  private scene: THREE.Scene;

  // Screen Canvas & Texture
  public screenCanvas: HTMLCanvasElement;
  public screenCtx: CanvasRenderingContext2D;
  public screenTexture: THREE.CanvasTexture;
  private screenPanelMesh: THREE.Mesh | null = null;

  // Screen State
  private typedText: string = 'CYBER ';
  private terminalLines: string[] = [
    'CYBER-OS v4.2 [LIVE HARDWARE KERNEL READY]',
    'DIRECT MEMORY ACCESS & APU INTERRUPT MATRIX: ONLINE',
    'STATUS: TYPE ON 3D KEYBOARD OR PHYSICAL KEYS TO TEST BUS',
  ];
  private cursorBlinkTimer = 0;
  private isCursorVisible = true;
  private trackpadCursor = { x: 512, y: 320, active: false };

  // 3D Interactive Keys & Trackpad
  private keyMeshes = new Map<string, THREE.Mesh>();
  private hoveredKey: THREE.Mesh | null = null;
  private trackpadMesh: THREE.Mesh | null = null;

  // Thermal, Exhaust & Battery
  private cpuDieMesh: THREE.Mesh | null = null;
  private ramMesh: THREE.Mesh | null = null;
  private blowerFans: THREE.Object3D[] = [];
  public cpuTemp = 42; // Celsius
  private targetCpuTemp = 42;
  private exhaustParticles: { pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number; side: number }[] = [];
  private exhaustParticleMesh: THREE.InstancedMesh;
  private maxExhaust = 48;
  private dummyObj = new THREE.Object3D();

  // Signal Packets
  private signalPacketPool: {
    mesh: THREE.Mesh;
    active: boolean;
    progress: number;
    speed: number;
    curve: THREE.CatmullRomCurve3;
    stage: 'bus' | 'cpu_ram' | 'display';
    keyChar: string;
  }[] = [];
  private maxPackets = 16;

  // Battery Energy Conduits
  private batteryConduitsGroup: THREE.Group;

  // Callback to React HUD
  public onStepChange?: (data: SimulationStepData) => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'Laptop_Live_Simulation';
    this.scene.add(this.rootGroup);

    // 1. Setup High-Resolution Screen Canvas Texture
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 640;
    this.screenCtx = this.screenCanvas.getContext('2d')!;
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.colorSpace = THREE.SRGBColorSpace;
    this.screenTexture.minFilter = THREE.LinearFilter;
    this.screenTexture.magFilter = THREE.LinearFilter;
    this.renderScreen();

    // 2. Setup Exhaust Particle System
    const exhaustGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const exhaustMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
    });
    this.exhaustParticleMesh = new THREE.InstancedMesh(exhaustGeo, exhaustMat, this.maxExhaust);
    this.exhaustParticleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rootGroup.add(this.exhaustParticleMesh);

    for (let i = 0; i < this.maxExhaust; i++) {
      this.exhaustParticles.push({
        pos: new THREE.Vector3(999, 999, 999),
        vel: new THREE.Vector3(0, 0, 0),
        life: 0,
        maxLife: 1.0,
        side: i % 2 === 0 ? -1 : 1,
      });
    }

    // 3. Signal Packet Pool
    const packetGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
    });
    for (let i = 0; i < this.maxPackets; i++) {
      const pMesh = new THREE.Mesh(packetGeo, packetMat.clone());
      pMesh.visible = false;
      this.rootGroup.add(pMesh);
      this.signalPacketPool.push({
        mesh: pMesh,
        active: false,
        progress: 0,
        speed: 1.8,
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, 0),
        ]),
        stage: 'bus',
        keyChar: 'A',
      });
    }

    // 4. Battery Energy Conduits
    this.batteryConduitsGroup = this.createBatteryConduits();
    this.rootGroup.add(this.batteryConduitsGroup);
  }

  // Register components from pcBuilder
  public registerComponents(params: {
    screenMesh: THREE.Mesh;
    cpuDie: THREE.Mesh;
    ram: THREE.Mesh;
    trackpad: THREE.Mesh;
    fans: THREE.Object3D[];
    keys: Map<string, THREE.Mesh>;
  }) {
    this.screenPanelMesh = params.screenMesh;
    this.cpuDieMesh = params.cpuDie;
    this.ramMesh = params.ram;
    this.trackpadMesh = params.trackpad;
    this.blowerFans = params.fans;
    this.keyMeshes = params.keys;

    // Attach dynamic texture to the laptop screen
    if (this.screenPanelMesh.material instanceof THREE.MeshStandardMaterial) {
      this.screenPanelMesh.material.map = this.screenTexture;
      this.screenPanelMesh.material.emissiveMap = this.screenTexture;
      this.screenPanelMesh.material.emissive = new THREE.Color(0xffffff);
      this.screenPanelMesh.material.emissiveIntensity = 1.35;
      this.screenPanelMesh.material.needsUpdate = true;
    }
  }

  private createBatteryConduits(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Battery_Power_Conduits';

    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.8,
      roughness: 0.3,
    });

    // 4 power delivery bus lines from Li-Po cells to motherboard VRMs
    const lineCoords = [
      [new THREE.Vector3(-6.0, -0.05, 3.8), new THREE.Vector3(-3.0, 0.05, 1.2), new THREE.Vector3(-3.0, 0.1, -1.2)],
      [new THREE.Vector3(-2.0, -0.05, 3.8), new THREE.Vector3(-1.0, 0.05, 1.2), new THREE.Vector3(-2.0, 0.1, -1.2)],
      [new THREE.Vector3(2.0, -0.05, 3.8), new THREE.Vector3(1.0, 0.05, 1.2), new THREE.Vector3(1.5, 0.1, -1.2)],
      [new THREE.Vector3(6.0, -0.05, 3.8), new THREE.Vector3(3.0, 0.05, 1.2), new THREE.Vector3(3.0, 0.1, -1.2)],
    ];

    lineCoords.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.06, 6, false);
      const tube = new THREE.Mesh(tubeGeo, conduitMat);
      group.add(tube);
    });

    return group;
  }

  // Handle Trackpad pointer movement
  public handleTrackpadPointer(normalizedX: number, normalizedY: number) {
    // Map normalized [-1..1] or [0..1] to screen pixels [40..984], [60..580]
    this.trackpadCursor.active = true;
    this.trackpadCursor.x = 512 + normalizedX * 420;
    this.trackpadCursor.y = 320 - normalizedY * 230;
    this.renderScreen();
  }

  // Handle Key Hover
  public handleKeyHover(keyMesh: THREE.Mesh | null) {
    if (this.hoveredKey && this.hoveredKey !== keyMesh) {
      const mat = this.hoveredKey.material as THREE.MeshStandardMaterial;
      if (mat && 'emissive' in mat) {
        mat.emissive.setHex(0x00f0ff);
        mat.emissiveIntensity = 0.4;
      }
    }
    this.hoveredKey = keyMesh;
    if (this.hoveredKey) {
      const mat = this.hoveredKey.material as THREE.MeshStandardMaterial;
      if (mat && 'emissive' in mat) {
        mat.emissive.setHex(0x00f0ff);
        mat.emissiveIntensity = 1.6;
      }
    }
  }

  // Trigger Keystroke Live Pipeline
  public triggerKeystroke(char: string) {
    const upperChar = char.toUpperCase();
    const keyMesh = this.keyMeshes.get(upperChar) || this.keyMeshes.get(char);

    // 1. Key 3D Depression Animation
    if (keyMesh) {
      const originalY = keyMesh.userData.originalY ?? keyMesh.position.y;
      keyMesh.userData.originalY = originalY;

      gsap.to(keyMesh.position, {
        y: originalY - 0.12,
        duration: 0.06,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      });

      const mat = keyMesh.material as THREE.MeshStandardMaterial;
      if (mat && 'emissive' in mat) {
        mat.emissive.setHex(0x00f0ff);
        mat.emissiveIntensity = 3.5;
        gsap.to(mat, {
          emissiveIntensity: 0.4,
          duration: 0.4,
          delay: 0.15,
        });
      }
    }

    // Report Step 1: Keypress
    this.onStepChange?.({
      step: 'keypress',
      stepNumber: 1,
      keyChar: upperChar,
      stageTitleAr: 'مصفوفة المفاتيح (Key Switch Matrix)',
      stageDescAr: `تم إغلاق دائرة المفتاح '${upperChar}' وتوليد مقاطعة عتادية (IRQ Event).`,
      hardwareStage: 'Keyboard Controller IC · Matrix Scan IRQ',
      latencyMs: 1.2,
    });

    // 2. Spawn Signal Packet (Key -> Motherboard Trace -> CPU)
    this.spawnSignalPacket(upperChar, keyMesh);

    // 3. Thermal & Fan Speed Kick
    this.targetCpuTemp = Math.min(84, this.targetCpuTemp + 2.5);
    this.spawnExhaustBursts(4);
  }

  private spawnSignalPacket(char: string, keyMesh?: THREE.Mesh) {
    const packet = this.signalPacketPool.find((p) => !p.active);
    if (!packet) return;

    // Start point: At key position
    const startPos = new THREE.Vector3(0, 0.35, -2.6);
    if (keyMesh) {
      keyMesh.getWorldPosition(startPos);
      this.rootGroup.worldToLocal(startPos);
    }

    // Mid point: Motherboard trace layer
    const midPos = new THREE.Vector3(startPos.x * 0.7, 0.05, startPos.z * 0.6 - 0.5);
    // Destination: CPU Die
    const cpuPos = new THREE.Vector3(-3.2, 0.2, -2.5);

    packet.curve = new THREE.CatmullRomCurve3([startPos, midPos, cpuPos]);
    packet.progress = 0;
    packet.speed = 2.4;
    packet.stage = 'bus';
    packet.keyChar = char;
    packet.active = true;
    packet.mesh.visible = true;
    (packet.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);

    // Notify Bus transfer
    setTimeout(() => {
      this.onStepChange?.({
        step: 'bus',
        stepNumber: 2,
        keyChar: char,
        stageTitleAr: 'مسار اللوحة الأم (Motherboard Bus Traces)',
        stageDescAr: `تنتقل الإشارة الكهربائية عبر ناقل PCIe/LPC إلى وحدة التحكم بالمعالج.`,
        hardwareStage: 'Motherboard Low-Voltage Differential Signals (LVDS)',
        latencyMs: 3.4,
      });
    }, 120);
  }

  private handlePacketReachCpu(packet: (typeof this.signalPacketPool)[0]) {
    // 1. CPU Flash (Intense Orange/Red load indicator)
    if (this.cpuDieMesh) {
      const mat = this.cpuDieMesh.material as THREE.MeshStandardMaterial;
      if (mat && 'emissive' in mat) {
        mat.emissive.setHex(0xff3b00);
        mat.emissiveIntensity = 4.5;
        gsap.to(mat, {
          emissiveIntensity: 0.1,
          duration: 0.35,
          ease: 'power2.out',
        });
      }
    }

    // Report Step 3: CPU & RAM
    this.onStepChange?.({
      step: 'processing',
      stepNumber: 3,
      keyChar: packet.keyChar,
      stageTitleAr: 'المعالجة السريعة (CPU & LPDDR5 RAM)',
      stageDescAr: `المعالج (APU) يعالج شفرة المفتاح ويحدّث مخزن الذاكرة المؤقت (Buffer).`,
      hardwareStage: 'APU Core 0 Execution · LPDDR5 Cache Line Update',
      latencyMs: 5.8,
    });

    // 2. RAM Flash
    if (this.ramMesh) {
      const ramMat = this.ramMesh.material as THREE.MeshStandardMaterial;
      if (ramMat && 'emissive' in ramMat) {
        ramMat.emissive.setHex(0x00f0ff);
        ramMat.emissiveIntensity = 3.8;
        gsap.to(ramMat, {
          emissiveIntensity: 0.2,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }

    // 3. Stage 2: Move from CPU -> Hinge -> Screen
    const cpuPos = new THREE.Vector3(-3.2, 0.2, -2.5);
    const hingePos = new THREE.Vector3(0, 0.45, -7.1);
    const screenCenter = new THREE.Vector3(0, 7.3, -5.2);

    packet.curve = new THREE.CatmullRomCurve3([cpuPos, hingePos, screenCenter]);
    packet.progress = 0;
    packet.speed = 2.8;
    packet.stage = 'display';
    (packet.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x9d00ff);
  }

  private handlePacketReachScreen(packet: (typeof this.signalPacketPool)[0]) {
    packet.active = false;
    packet.mesh.visible = false;

    // 1. Append Character to Screen
    this.appendCharacterToScreen(packet.keyChar);

    // 2. Report Step 4: Display
    this.onStepChange?.({
      step: 'display',
      stepNumber: 4,
      keyChar: packet.keyChar,
      stageTitleAr: 'الإخراج المرئي (eDP Screen Render)',
      stageDescAr: `كارت الشاشة يرسل الحرف عبر كابل الشاشة المدمج ويُعرض في الطرفية!`,
      hardwareStage: 'RDNA3 GPU Framebuffer · eDP 1.4 Display Output',
      latencyMs: 8.2,
    });
  }

  private appendCharacterToScreen(char: string) {
    if (char === 'ENTER') {
      this.terminalLines.push(`user@cyber-laptop:~$ ${this.typedText}`);
      if (this.terminalLines.length > 9) {
        this.terminalLines.shift();
      }
      this.typedText = '';
    } else if (char === 'BACKSPACE' || char === 'DEL') {
      this.typedText = this.typedText.slice(0, -1);
    } else if (char === 'SPACE') {
      this.typedText += ' ';
    } else if (char.length === 1) {
      if (this.typedText.length < 32) {
        this.typedText += char;
      }
    }
    this.renderScreen();
  }

  // Render the Cyberpunk OS Desktop & Terminal onto the Canvas
  private renderScreen() {
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;

    // 1. Wallpaper & Deep Synthwave Background
    ctx.fillStyle = '#06080e';
    ctx.fillRect(0, 0, w, h);

    // Futuristic Grid Lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Top System Status Bar
    ctx.fillStyle = 'rgba(11, 16, 26, 0.95)';
    ctx.fillRect(0, 0, w, 38);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.strokeRect(0, 0, w, 38);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('⚡ CYBER_OS v4.2 PRO', 18, 24);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(`CPU: ${Math.round(this.cpuTemp)}°C`, 220, 24);
    ctx.fillText('RAM: 14.2 / 32 GB', 340, 24);
    ctx.fillText('Wi-Fi 6E: 2.4 Gbps 📶', 500, 24);
    ctx.fillText('BATTERY: 98% 🔋', 690, 24);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    ctx.fillStyle = '#34d399';
    ctx.fillText(timeStr, 880, 24);

    // 3. Cyber Terminal Window
    const tx = 40;
    const ty = 60;
    const tw = w - 80;
    const th = h - 90;

    // Window shadow & body
    ctx.fillStyle = 'rgba(6, 10, 18, 0.92)';
    ctx.fillRect(tx, ty, tw, th);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tx, ty, tw, th);

    // Terminal Titlebar
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(tx, ty, tw, 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('● ● ●  TERMINAL - HARDWARE BUS MONITOR & LIVE KEYSTROKE DISPLAY', tx + 16, ty + 20);

    // Terminal Content
    ctx.font = '15px "Courier New", monospace';
    let lineY = ty + 60;

    this.terminalLines.forEach((line) => {
      ctx.fillStyle = line.startsWith('>') ? '#38bdf8' : '#94a3b8';
      ctx.fillText(line, tx + 20, lineY);
      lineY += 26;
    });

    // Current Prompt Line
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px "Courier New", monospace';
    const promptPrefix = 'user@cyber-laptop:~$ ';
    ctx.fillText(promptPrefix, tx + 20, lineY);

    const prefixWidth = ctx.measureText(promptPrefix).width;
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(this.typedText, tx + 20 + prefixWidth, lineY);

    // Blinking Cursor
    if (this.isCursorVisible) {
      const textWidth = ctx.measureText(this.typedText).width;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(tx + 20 + prefixWidth + textWidth + 2, lineY - 14, 10, 18);
    }

    // Hardware Pipeline Visual Footnote inside Terminal
    const footY = ty + th - 24;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.fillRect(tx + 10, footY - 18, tw - 20, 1);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      `[HARDWARE BUS] KEYSWITCH -> MOTHERBOARD BUS -> APU DIE -> RAM -> eDP DISPLAY · 60 FPS LIVE`,
      tx + 20,
      footY
    );

    // 4. Mouse Pointer from Trackpad
    if (this.trackpadCursor.active) {
      const cx = this.trackpadCursor.x;
      const cy = this.trackpadCursor.y;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(4, 12);
      ctx.lineTo(8, 20);
      ctx.lineTo(11, 19);
      ctx.lineTo(7, 11);
      ctx.lineTo(13, 11);
      ctx.closePath();
      ctx.fillStyle = '#00f0ff';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    this.screenTexture.needsUpdate = true;
  }

  private spawnExhaustBursts(count: number) {
    for (let c = 0; c < count; c++) {
      const p = this.exhaustParticles.find((item) => item.life <= 0);
      if (!p) break;

      const side = Math.random() > 0.5 ? 1 : -1;
      p.side = side;
      // Start at left or right blower exhaust
      p.pos.set(side * 8.4, 0.1, -1.8 + (Math.random() - 0.5) * 1.2);
      p.vel.set(
        side * (1.5 + Math.random() * 2.0),
        (Math.random() - 0.2) * 0.4,
        (Math.random() - 0.5) * 0.8
      );
      p.life = 0.8 + Math.random() * 0.4;
      p.maxLife = p.life;
    }
  }

  public update(delta: number) {
    // 1. Cursor Blinking
    this.cursorBlinkTimer += delta;
    if (this.cursorBlinkTimer >= 0.45) {
      this.cursorBlinkTimer = 0;
      this.isCursorVisible = !this.isCursorVisible;
      this.renderScreen();
    }

    // 2. CPU Temperature cooling down gradually
    if (this.targetCpuTemp > 42) {
      this.targetCpuTemp = Math.max(42, this.targetCpuTemp - delta * 3.0);
    }
    this.cpuTemp = THREE.MathUtils.damp(this.cpuTemp, this.targetCpuTemp, 2.0, delta);

    // 3. Update Signal Packets
    this.signalPacketPool.forEach((packet) => {
      if (!packet.active) return;
      packet.progress += delta * packet.speed;

      if (packet.progress >= 1.0) {
        if (packet.stage === 'bus') {
          this.handlePacketReachCpu(packet);
        } else if (packet.stage === 'display') {
          this.handlePacketReachScreen(packet);
        }
      } else {
        const point = packet.curve.getPointAt(packet.progress);
        packet.mesh.position.copy(point);
      }
    });

    // 4. Update Exhaust Air Particles
    let activeParticles = 0;
    for (let i = 0; i < this.maxExhaust; i++) {
      const p = this.exhaustParticles[i];
      if (p.life > 0) {
        p.life -= delta;
        p.pos.addScaledVector(p.vel, delta);

        const scale = (p.life / p.maxLife) * 1.5;
        this.dummyObj.position.copy(p.pos);
        this.dummyObj.scale.set(scale, scale, scale);
        this.dummyObj.updateMatrix();
        this.exhaustParticleMesh.setMatrixAt(i, this.dummyObj.matrix);
        activeParticles++;
      } else {
        this.dummyObj.position.set(999, 999, 999);
        this.dummyObj.scale.set(0.01, 0.01, 0.01);
        this.dummyObj.updateMatrix();
        this.exhaustParticleMesh.setMatrixAt(i, this.dummyObj.matrix);
      }
    }
    if (activeParticles > 0) {
      this.exhaustParticleMesh.instanceMatrix.needsUpdate = true;
    }
  }

  public dispose() {
    this.signalPacketPool.forEach((p) => {
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
      this.rootGroup.remove(p.mesh);
    });
    this.exhaustParticleMesh.geometry.dispose();
    (this.exhaustParticleMesh.material as THREE.Material).dispose();
    this.screenTexture.dispose();
    this.scene.remove(this.rootGroup);
  }
}
