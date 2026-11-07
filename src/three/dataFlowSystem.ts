import * as THREE from 'three';

export interface DataFlowSystem {
  rootGroup: THREE.Group;
  globeGroup: THREE.Group;
  update: (delta: number, isFlowActive: boolean, isPoweredOn: boolean) => void;
  triggerPacketBurst: () => void;
  dispose: () => void;
}

/**
 * Creates the holographic 3D Earth Globe and the procedural particle data flow system.
 */
export function createDataFlowSystem(): DataFlowSystem {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'DataFlow_System';

  // ==========================================
  // 1. HOLOGRAPHIC ROTATING 3D GLOBE (The Internet)
  // ==========================================
  const globeGroup = new THREE.Group();
  globeGroup.name = 'Holographic_Globe';
  globeGroup.position.set(22, 14, -14);
  globeGroup.userData = { componentId: 'internet' };
  rootGroup.add(globeGroup);

  // Procedural Earth Texture on Canvas
  const globeCanvas = document.createElement('canvas');
  globeCanvas.width = 1024;
  globeCanvas.height = 512;
  const gCtx = globeCanvas.getContext('2d')!;

  // Deep cyber ocean
  gCtx.fillStyle = '#060d1a';
  gCtx.fillRect(0, 0, 1024, 512);

  // Cyber latitude & longitude grid
  gCtx.strokeStyle = '#0a223a';
  gCtx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 64) {
    gCtx.beginPath();
    gCtx.moveTo(x, 0);
    gCtx.lineTo(x, 512);
    gCtx.stroke();
  }
  for (let y = 0; y < 512; y += 32) {
    gCtx.beginPath();
    gCtx.moveTo(0, y);
    gCtx.lineTo(1024, y);
    gCtx.stroke();
  }

  // Draw procedural cyber stylized continents
  gCtx.fillStyle = '#00f0ff';
  const drawCyberContinent = (cx: number, cy: number, rx: number, ry: number) => {
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const r = (i % 2 === 0 ? rx : rx * 0.8) + Math.sin(i * 3) * (rx * 0.2);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * ry;
      if (i === 0) gCtx.beginPath();
      gCtx.lineTo(px, py);
    }
    gCtx.closePath();
    gCtx.fill();
  };

  // Americas
  drawCyberContinent(260, 220, 110, 160);
  // Europe & Africa
  drawCyberContinent(520, 240, 90, 170);
  // Asia & Oceania
  drawCyberContinent(760, 230, 150, 160);
  drawCyberContinent(840, 380, 60, 45);

  const globeTex = new THREE.CanvasTexture(globeCanvas);
  globeTex.colorSpace = THREE.SRGBColorSpace;

  // Globe Mesh
  const globeGeo = new THREE.SphereGeometry(3.6, 32, 32);
  const globeMat = new THREE.MeshStandardMaterial({
    map: globeTex,
    color: 0x00f0ff,
    emissive: 0x004466,
    emissiveIntensity: 0.8,
    metalness: 0.7,
    roughness: 0.3,
    wireframe: false,
  });
  const globeMesh = new THREE.Mesh(globeGeo, globeMat);
  globeMesh.userData = { componentId: 'internet' };
  globeGroup.add(globeMesh);

  // Atmospheric Glowing Halo
  const haloGeo = new THREE.SphereGeometry(3.9, 24, 24);
  const haloMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.22,
    wireframe: true,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  globeGroup.add(haloMesh);

  // Orbital Rings
  const orbitRingGeo = new THREE.TorusGeometry(5.2, 0.06, 16, 64);
  const ringMat1 = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.6,
  });
  const ring1 = new THREE.Mesh(orbitRingGeo, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  globeGroup.add(ring1);

  const ringMat2 = new THREE.MeshStandardMaterial({
    color: 0x9d00ff,
    emissive: 0x9d00ff,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.5,
  });
  const ring2 = new THREE.Mesh(orbitRingGeo, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  ring2.rotation.x = -Math.PI / 6;
  globeGroup.add(ring2);

  // Glowing Ripple Wave (triggered on packet arrival)
  const rippleGeo = new THREE.RingGeometry(3.7, 4.0, 32);
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
  });
  const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
  globeGroup.add(rippleMesh);

  // ==========================================
  // 2. FIBER-OPTIC INTERNET ETHERNET CABLE
  // ==========================================
  // From Motherboard rear I/O [-4.2, 8.5, -9.5] to Globe [22, 14, -14]
  const internetCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.2, 8.5, -9.5),
    new THREE.Vector3(2.0, 10.5, -12.0),
    new THREE.Vector3(12.0, 12.0, -15.0),
    new THREE.Vector3(22.0, 14.0, -14.0),
  ]);

  const cableGeo = new THREE.TubeGeometry(internetCurve, 32, 0.22, 8, false);
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x0d233a,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85,
  });
  const cableMesh = new THREE.Mesh(cableGeo, cableMat);
  rootGroup.add(cableMesh);

  // ==========================================
  // 3. INTERNAL DATA PATHWAYS (Curves)
  // ==========================================
  // Path A: CPU [-5.6, 7.5, -1] -> GPU [-1.0, -0.5, 3.5] (Cyan Instructions)
  const pathCpuGpu = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.6, 7.5, -1.0),
    new THREE.Vector3(-5.6, 3.0, 1.0),
    new THREE.Vector3(-2.5, 0.0, 2.5),
    new THREE.Vector3(-1.0, -0.5, 3.5),
  ]);

  // Path B: CPU [-5.6, 7.5, -1] -> RAM [-5.0, 7.5, 5.5] (Green Memory Data)
  const pathCpuRam = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.6, 7.5, -1.0),
    new THREE.Vector3(-5.6, 7.5, 2.0),
    new THREE.Vector3(-5.0, 7.5, 5.5),
  ]);

  // Path C: CPU [-5.6, 7.5, -1] -> SSD [-5.3, 0.5, 4.0] (Green Storage Stream)
  const pathCpuSsd = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.6, 7.5, -1.0),
    new THREE.Vector3(-5.6, 4.0, 2.0),
    new THREE.Vector3(-5.3, 0.5, 4.0),
  ]);

  // Path D: PSU [-2.5, -12.5, -4.5] -> Motherboard ATX [-5.5, 7.5, 10.2] (Orange Power)
  const pathPsuMb = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.5, -12.5, -4.5),
    new THREE.Vector3(-2.5, -5.0, 6.0),
    new THREE.Vector3(-5.5, 2.0, 9.0),
    new THREE.Vector3(-5.5, 7.5, 10.2),
  ]);

  // Path E: PSU [-2.5, -12.5, -4.5] -> GPU 16-Pin [4.8, -1.1, 8.5] (Orange Power)
  const pathPsuGpu = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.5, -12.5, -4.5),
    new THREE.Vector3(2.0, -8.0, 2.0),
    new THREE.Vector3(4.8, -4.0, 6.0),
    new THREE.Vector3(4.8, -1.1, 8.5),
  ]);

  // ==========================================
  // 4. DATA PARTICLES INSTANCED MESH
  // ==========================================
  // We represent 96 particles total (24 per stream, high-performance):
  // - 24 Cyan instruction particles (CPU <-> GPU)
  // - 24 Green memory data particles (CPU <-> RAM & SSD)
  // - 24 Orange power current particles (PSU -> Components)
  // - 24 Internet network packets (Motherboard <-> Globe)
  const totalParticles = 96;
  const particleGeo = new THREE.SphereGeometry(0.22, 8, 8);
  const particleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 3.5,
    roughness: 0.1,
  });
  const instancedParticles = new THREE.InstancedMesh(
    particleGeo,
    particleMat,
    totalParticles
  );
  instancedParticles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rootGroup.add(instancedParticles);

  interface ParticleState {
    curve: THREE.CatmullRomCurve3;
    progress: number;
    speed: number;
    color: THREE.Color;
    isReverse: boolean;
  }

  const particles: ParticleState[] = [];
  const dummyMatrix = new THREE.Matrix4();
  const dummyPos = new THREE.Vector3();
  const dummyScale = new THREE.Vector3(1, 1, 1);
  const dummyQuat = new THREE.Quaternion();

  const cyanColor = new THREE.Color(0x00f0ff);
  const greenColor = new THREE.Color(0x10b981);
  const orangeColor = new THREE.Color(0xff8800);
  const magentaColor = new THREE.Color(0xd946ef);

  for (let i = 0; i < totalParticles; i++) {
    let curve: THREE.CatmullRomCurve3;
    let color: THREE.Color;
    let speed = 0.25 + Math.random() * 0.35;
    let isReverse = Math.random() > 0.5;

    if (i < 24) {
      // Instruction Flow (CPU <-> GPU)
      curve = pathCpuGpu;
      color = cyanColor;
    } else if (i < 48) {
      // Memory / Storage Data Flow (CPU <-> RAM / SSD)
      curve = i < 36 ? pathCpuRam : pathCpuSsd;
      color = greenColor;
    } else if (i < 72) {
      // Power Currents (PSU -> MB / GPU)
      curve = i < 60 ? pathPsuMb : pathPsuGpu;
      color = orangeColor;
      isReverse = false; // Power only flows outwards from PSU
      speed = 0.15 + Math.random() * 0.25;
    } else {
      // Internet Packets (MB <-> Globe)
      curve = internetCurve;
      color = i % 2 === 0 ? cyanColor : magentaColor;
      speed = 0.35 + Math.random() * 0.45;
    }

    particles.push({
      curve,
      progress: Math.random(),
      speed,
      color,
      isReverse,
    });

    instancedParticles.setColorAt(i, color);
  }
  if (instancedParticles.instanceColor) {
    instancedParticles.instanceColor.needsUpdate = true;
  }

  let rippleProgress = 1.0;

  const triggerPacketBurst = () => {
    rippleProgress = 0.0;
  };

  const update = (delta: number, isFlowActive: boolean, isPoweredOn: boolean) => {
    // 1. Rotate Globe
    globeMesh.rotation.y += delta * 0.35;
    ring1.rotation.z += delta * 0.4;
    ring2.rotation.z -= delta * 0.3;

    // 2. Ripple Wave Expansion
    if (rippleProgress < 1.0) {
      rippleProgress += delta * 1.5;
      const scale = 1.0 + rippleProgress * 1.8;
      rippleMesh.scale.set(scale, scale, scale);
      rippleMat.opacity = Math.max(0, 1.0 - rippleProgress);
    } else {
      rippleMat.opacity = 0.0;
    }

    // 3. Update Particle Positions
    if (!isPoweredOn) {
      // Dim or hide particles when system is off
      instancedParticles.visible = false;
      cableMat.emissiveIntensity = 0.1;
      globeMat.emissiveIntensity = 0.2;
      return;
    }

    instancedParticles.visible = true;
    cableMat.emissiveIntensity = isFlowActive ? 1.4 : 0.4;
    globeMat.emissiveIntensity = isFlowActive ? 1.2 : 0.6;

    const speedMultiplier = isFlowActive ? 1.0 : 0.25;

    for (let i = 0; i < totalParticles; i++) {
      const p = particles[i];
      p.progress += (p.speed * speedMultiplier * delta);
      if (p.progress >= 1.0) {
        p.progress = 0.0;
        if (p.curve === internetCurve) {
          triggerPacketBurst();
        }
      }

      const t = p.isReverse ? 1.0 - p.progress : p.progress;
      p.curve.getPointAt(t, dummyPos);

      // Micro wobble
      dummyPos.x += Math.sin(t * 12 + i) * 0.05;
      dummyPos.y += Math.cos(t * 12 + i) * 0.05;

      dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
      instancedParticles.setMatrixAt(i, dummyMatrix);
    }

    instancedParticles.instanceMatrix.needsUpdate = true;
  };

  const dispose = () => {
    globeTex.dispose();
    globeGeo.dispose();
    globeMat.dispose();
    haloGeo.dispose();
    haloMat.dispose();
    orbitRingGeo.dispose();
    ringMat1.dispose();
    ringMat2.dispose();
    rippleGeo.dispose();
    rippleMat.dispose();
    cableGeo.dispose();
    cableMat.dispose();
    particleGeo.dispose();
    particleMat.dispose();
    instancedParticles.dispose();
  };

  return {
    rootGroup,
    globeGroup,
    update,
    triggerPacketBurst,
    dispose,
  };
}
