import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  createMotherboardTextures,
  createBrushedMetalTexture,
  createHoneycombTexture,
  createFanHubTexture,
  createCpuIhsTexture,
  createLaptopScreenTexture,
  createKeyboardTexture,
} from './proceduralTextures';
import { ComponentId, DeviceType } from '../types';

export interface BuiltPcSystem {
  rootGroup: THREE.Group;
  componentGroups: Partial<Record<ComponentId, THREE.Group>>;
  animatedFans: THREE.Group[];
  glassPanel?: THREE.Mesh;
  laptopHinge?: THREE.Group;
  emissiveMaterials: THREE.MeshStandardMaterial[];
  allMaterials: THREE.Material[];
  screenMesh?: THREE.Mesh;
  cpuDieMesh?: THREE.Mesh;
  ramMesh?: THREE.Mesh;
  trackpadMesh?: THREE.Mesh;
  laptopKeys?: Map<string, THREE.Mesh>;
}

/**
 * Merges an array of pre-transformed BufferGeometries into a single BufferGeometry,
 * disposing the intermediate input geometries to avoid memory leaks.
 */
function mergeGeometriesSafely(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry();
  if (geometries.length === 1) return geometries[0];
  const merged = BufferGeometryUtils.mergeGeometries(geometries, false);
  geometries.forEach((g) => g.dispose());
  return merged || new THREE.BufferGeometry();
}

/**
 * Builds the complete procedural 3D Desktop PC model.
 */
export function buildDesktopSystem(): BuiltPcSystem {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CyberPC_System';

  const animatedFans: THREE.Group[] = [];
  const emissiveMaterials: THREE.MeshStandardMaterial[] = [];
  const allMaterials: THREE.Material[] = [];

  const trackMat = <T extends THREE.Material>(mat: T): T => {
    allMaterials.push(mat);
    return mat;
  };

  // Shared procedural textures
  const { colorMap: mbColor, emissiveMap: mbEmissive, bumpMap: mbBump } =
    createMotherboardTextures();
  const brushedMetalBump = createBrushedMetalTexture();
  const honeycombTex = createHoneycombTexture();
  const fanHubTex = createFanHubTexture();
  const cpuIhsTex = createCpuIhsTexture();

  // Shared PBR Materials
  const darkSteelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x181c24,
      metalness: 0.85,
      roughness: 0.35,
      bumpMap: brushedMetalBump,
      bumpScale: 0.02,
    })
  );

  const blackPlasticMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x121417,
      metalness: 0.1,
      roughness: 0.65,
    })
  );

  const goldPinsMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2,
    })
  );

  const copperMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc87d55,
      metalness: 0.9,
      roughness: 0.25,
    })
  );

  const aluminumFinsMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.92,
      roughness: 0.2,
      bumpMap: brushedMetalBump,
      bumpScale: 0.015,
    })
  );

  const neonCyanMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
      metalness: 0.1,
      roughness: 0.2,
    })
  );
  emissiveMaterials.push(neonCyanMat);

  const neonVioletMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x9d00ff,
      emissive: 0x9d00ff,
      emissiveIntensity: 1.8,
      metalness: 0.1,
      roughness: 0.2,
    })
  );
  emissiveMaterials.push(neonVioletMat);

  const fanBladeMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x111622,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
      transmission: 0.4,
      ior: 1.5,
    })
  );

  // Helper to mark userData with selective shadow casting
  const tagObject = (obj: THREE.Object3D, id: ComponentId, castShadow = false) => {
    obj.userData = { componentId: id };
    obj.traverse((child) => {
      child.userData = { componentId: id };
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = castShadow;
      }
    });
  };

  // Helper to create a multi-blade rotating fan rotor
  const createFanRotor = (
    radius: number,
    bladeCount = 7,
    glowColor: THREE.ColorRepresentation = 0x00f0ff
  ): THREE.Group => {
    const rotor = new THREE.Group();

    // Center hub cylinder
    const hubGeom = new THREE.CylinderGeometry(
      radius * 0.35,
      radius * 0.35,
      radius * 0.25,
      24
    );
    const hubMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x141820,
        map: fanHubTex,
        metalness: 0.8,
        roughness: 0.3,
      })
    );
    const hubMesh = new THREE.Mesh(hubGeom, hubMat);
    hubMesh.rotation.x = Math.PI / 2;
    rotor.add(hubMesh);

    // Glowing center ring
    const ringGeom = new THREE.TorusGeometry(
      radius * 0.36,
      radius * 0.02,
      12,
      32
    );
    const ringMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: glowColor,
        emissive: glowColor,
        emissiveIntensity: 1.5,
      })
    );
    emissiveMaterials.push(ringMat);
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    rotor.add(ringMesh);

    // Aerodynamic curved blades
    const bladeLength = radius * 0.6;
    const bladeGeom = new THREE.BoxGeometry(
      bladeLength,
      radius * 0.03,
      radius * 0.28
    );
    bladeGeom.translate(bladeLength / 2 + radius * 0.25, 0, 0);

    for (let i = 0; i < bladeCount; i++) {
      const bladeMesh = new THREE.Mesh(bladeGeom, fanBladeMat);
      bladeMesh.rotation.z = (Math.PI * 2 * i) / bladeCount;
      bladeMesh.rotation.x = 0.38; // pitch angle
      rotor.add(bladeMesh);
    }

    animatedFans.push(rotor);
    return rotor;
  };

  // ==========================================
  // 1. MOTHERBOARD (ATX 24 x 30 units)
  // ==========================================
  const mbGroup = new THREE.Group();
  mbGroup.name = 'Motherboard_Group';
  mbGroup.position.set(-6, 2, 0);

  // PCB Board
  const mbPcbGeom = new THREE.BoxGeometry(0.3, 29, 23.5);
  const mbMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: mbColor,
      bumpMap: mbBump,
      bumpScale: 0.03,
      emissiveMap: mbEmissive,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.9,
      metalness: 0.5,
      roughness: 0.45,
    })
  );
  emissiveMaterials.push(mbMat);
  const mbPcbMesh = new THREE.Mesh(mbPcbGeom, mbMat);
  mbGroup.add(mbPcbMesh);

  // CPU Socket Base (AM5 / LGA1700)
  const socketBaseGeom = new THREE.BoxGeometry(0.35, 5.2, 5.2);
  const socketMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x222630,
      metalness: 0.7,
      roughness: 0.4,
    })
  );
  const socketBase = new THREE.Mesh(socketBaseGeom, socketMat);
  socketBase.position.set(0.2, 5.5, -1.0);
  mbGroup.add(socketBase);

  // Socket metal pins grid
  const pinGridGeom = new THREE.BoxGeometry(0.05, 4.4, 4.4);
  const pinGrid = new THREE.Mesh(pinGridGeom, goldPinsMat);
  pinGrid.position.set(0.38, 5.5, -1.0);
  mbGroup.add(pinGrid);

  // Socket retention lever
  const leverGeom = new THREE.CylinderGeometry(0.08, 0.08, 5.5, 8);
  const lever = new THREE.Mesh(leverGeom, aluminumFinsMat);
  lever.position.set(0.35, 5.5, -3.9);
  lever.rotation.z = Math.PI / 2;
  mbGroup.add(lever);

  // VRM & Chipset Heatsinks (Merged for minimal draw calls)
  const vrmMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1f242e,
      metalness: 0.9,
      roughness: 0.25,
      bumpMap: brushedMetalBump,
      bumpScale: 0.03,
    })
  );
  const vrmGeoms: THREE.BufferGeometry[] = [];
  const vTop = new THREE.BoxGeometry(1.6, 2.8, 8.5);
  vTop.translate(0.9, 10.2, -1.0);
  vrmGeoms.push(vTop);

  const vLeft = new THREE.BoxGeometry(1.6, 8.5, 2.5);
  vLeft.translate(0.9, 5.5, -6.0);
  vrmGeoms.push(vLeft);

  const cSet = new THREE.BoxGeometry(1.2, 6.0, 6.5);
  cSet.translate(0.7, -7.5, 6.5);
  vrmGeoms.push(cSet);

  mbGroup.add(new THREE.Mesh(mergeGeometriesSafely(vrmGeoms), vrmMat));

  // Neon accent strip on VRM heatsink
  const vrmAccentGeom = new THREE.BoxGeometry(0.1, 0.2, 8.0);
  const vrmAccent = new THREE.Mesh(vrmAccentGeom, neonVioletMat);
  vrmAccent.position.set(1.72, 10.2, -1.0);
  mbGroup.add(vrmAccent);

  // Chipset logo light
  const chipLogoGeom = new THREE.BoxGeometry(0.05, 1.8, 3.5);
  const chipLogo = new THREE.Mesh(chipLogoGeom, neonCyanMat);
  chipLogo.position.set(1.32, -7.5, 6.5);
  mbGroup.add(chipLogo);

  // 4x DDR5 DIMM Slots & Latches (Batch Merged)
  const slotGeoms: THREE.BufferGeometry[] = [];
  const latchGeoms: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const zOffset = 3.2 + i * 1.25;
    const sg = new THREE.BoxGeometry(0.4, 11.5, 0.45);
    sg.translate(0.3, 5.5, zOffset);
    slotGeoms.push(sg);

    const lt = new THREE.BoxGeometry(0.45, 0.6, 0.5);
    lt.translate(0.35, 11.2, zOffset);
    latchGeoms.push(lt);

    const lb = new THREE.BoxGeometry(0.45, 0.6, 0.5);
    lb.translate(0.35, -0.2, zOffset);
    latchGeoms.push(lb);
  }
  mbGroup.add(new THREE.Mesh(mergeGeometriesSafely(slotGeoms), blackPlasticMat));
  mbGroup.add(new THREE.Mesh(mergeGeometriesSafely(latchGeoms), aluminumFinsMat));

  // PCIe Slots (x16 and x1)
  const pcieX16Geom = new THREE.BoxGeometry(0.65, 0.75, 14.5);
  const pcieArmorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x9ba6b5,
      metalness: 0.95,
      roughness: 0.2,
    })
  );
  // Slot 1 (Primary PCIe 5.0 x16 for GPU)
  const pcie1 = new THREE.Mesh(pcieX16Geom, pcieArmorMat);
  pcie1.position.set(0.45, -2.5, 1.0);
  mbGroup.add(pcie1);

  // Slot 2
  const pcie2 = new THREE.Mesh(pcieX16Geom, blackPlasticMat);
  pcie2.position.set(0.45, -8.0, 1.0);
  mbGroup.add(pcie2);

  // Rear I/O Shield block
  const ioBlockGeom = new THREE.BoxGeometry(3.5, 12.0, 2.2);
  const ioBlock = new THREE.Mesh(ioBlockGeom, darkSteelMat);
  ioBlock.position.set(1.8, 6.5, -9.5);
  mbGroup.add(ioBlock);

  // 24-Pin ATX Power Header
  const atxGeom = new THREE.BoxGeometry(0.7, 5.0, 1.2);
  const atxHeader = new THREE.Mesh(atxGeom, blackPlasticMat);
  atxHeader.position.set(0.45, 7.5, 10.2);
  mbGroup.add(atxHeader);

  // Solid State Capacitors array (Merged into 1 single Draw Call)
  const capMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xabb4be,
      metalness: 0.95,
      roughness: 0.15,
    })
  );
  const capGeoms: THREE.BufferGeometry[] = [];
  for (let c = 0; c < 12; c++) {
    const cg = new THREE.CylinderGeometry(0.28, 0.28, 0.55, 10);
    cg.rotateZ(Math.PI / 2);
    cg.translate(0.35, 1.5 + (c % 6) * 1.3, -3.8 - Math.floor(c / 6) * 0.9);
    capGeoms.push(cg);
  }
  mbGroup.add(new THREE.Mesh(mergeGeometriesSafely(capGeoms), capMat));

  tagObject(mbGroup, 'motherboard');
  rootGroup.add(mbGroup);

  // ==========================================
  // 2. CPU (Processor Core)
  // ==========================================
  const cpuGroup = new THREE.Group();
  cpuGroup.name = 'CPU_Group';
  // Positioned directly over CPU socket
  cpuGroup.position.set(-5.6, 7.5, -1.0);

  // Green PCB Substrate
  const cpuSubstrateGeom = new THREE.BoxGeometry(0.12, 4.4, 4.4);
  const cpuSubstrateMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      metalness: 0.2,
      roughness: 0.5,
    })
  );
  const cpuSubstrate = new THREE.Mesh(cpuSubstrateGeom, cpuSubstrateMat);
  cpuGroup.add(cpuSubstrate);

  // Gold contact pads underside
  const cpuPinsGeom = new THREE.BoxGeometry(0.04, 4.0, 4.0);
  const cpuPins = new THREE.Mesh(cpuPinsGeom, goldPinsMat);
  cpuPins.position.set(-0.06, 0, 0);
  cpuGroup.add(cpuPins);

  // Nickel-plated copper IHS (Integrated Heat Spreader)
  const ihsGeom = new THREE.BoxGeometry(0.35, 3.8, 3.8);
  const ihsMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: cpuIhsTex,
      metalness: 0.95,
      roughness: 0.18,
    })
  );
  const ihsMesh = new THREE.Mesh(ihsGeom, ihsMat);
  ihsMesh.position.set(0.2, 0, 0);
  ihsMesh.rotation.y = Math.PI / 2;
  cpuGroup.add(ihsMesh);

  tagObject(cpuGroup, 'cpu');
  rootGroup.add(cpuGroup);

  // ==========================================
  // 3. CPU COOLER & HIGH-STATIC FAN
  // ==========================================
  const coolerGroup = new THREE.Group();
  coolerGroup.name = 'Cooler_Group';
  coolerGroup.position.set(-5.0, 7.5, -1.0);

  // Solid Copper Baseplate
  const baseplateGeom = new THREE.BoxGeometry(0.4, 4.5, 4.5);
  const baseplate = new THREE.Mesh(baseplateGeom, copperMat);
  baseplate.position.set(0.3, 0, 0);
  coolerGroup.add(baseplate);

  // 6x Copper Heatpipes (Merged)
  const pipeGeoms: THREE.BufferGeometry[] = [];
  for (let p = 0; p < 6; p++) {
    const zOffset = -1.5 + p * 0.6;
    const pg = new THREE.CylinderGeometry(0.18, 0.18, 9.5, 10);
    pg.translate(2.4, 0, zOffset);
    pipeGeoms.push(pg);
  }
  coolerGroup.add(new THREE.Mesh(mergeGeometriesSafely(pipeGeoms), copperMat));

  // Aluminum Cooling Fin Stack (38 thin plates merged into 1 Draw Call)
  const finGeoms: THREE.BufferGeometry[] = [];
  for (let f = 0; f < 38; f++) {
    const yOffset = -4.2 + f * 0.23;
    const fg = new THREE.BoxGeometry(4.2, 0.08, 9.0);
    fg.translate(2.6, yOffset, 0);
    finGeoms.push(fg);
  }
  coolerGroup.add(new THREE.Mesh(mergeGeometriesSafely(finGeoms), aluminumFinsMat));

  // Fan Shroud & Mount Frame
  const fanFrameGeom = new THREE.BoxGeometry(1.2, 9.4, 9.4);
  const fanFrame = new THREE.Mesh(fanFrameGeom, blackPlasticMat);
  fanFrame.position.set(5.2, 0, 0);
  coolerGroup.add(fanFrame);

  // Fan Rotor
  const cpuFanRotor = createFanRotor(4.2, 9, 0x00f0ff);
  cpuFanRotor.position.set(5.7, 0, 0);
  cpuFanRotor.rotation.y = Math.PI / 2;
  coolerGroup.add(cpuFanRotor);

  tagObject(coolerGroup, 'cooler');
  rootGroup.add(coolerGroup);

  // ==========================================
  // 4. RAM (Dual-Channel DDR5 RGB)
  // ==========================================
  const ramGroup = new THREE.Group();
  ramGroup.name = 'RAM_Group';
  // Positioned directly in DIMM slots 2 & 4
  ramGroup.position.set(-5.6, 7.5, 0);

  const createRamStick = (zPos: number, glowColor: THREE.ColorRepresentation) => {
    const stick = new THREE.Group();
    stick.position.set(0.65, 0, zPos);

    // PCB with gold edge
    const pcbGeom = new THREE.BoxGeometry(0.1, 10.5, 0.3);
    const pcb = new THREE.Mesh(pcbGeom, blackPlasticMat);
    stick.add(pcb);

    const goldEdgeGeom = new THREE.BoxGeometry(0.12, 1.2, 0.28);
    const goldEdge = new THREE.Mesh(goldEdgeGeom, goldPinsMat);
    goldEdge.position.set(0, -5.0, 0);
    stick.add(goldEdge);

    // Aluminum Heatsink Armor
    const armorGeom = new THREE.BoxGeometry(0.45, 9.0, 0.32);
    const armorMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1f232b,
        metalness: 0.95,
        roughness: 0.2,
        bumpMap: brushedMetalBump,
        bumpScale: 0.03,
      })
    );
    const armor = new THREE.Mesh(armorGeom, armorMat);
    armor.position.set(0, 0.6, 0);
    stick.add(armor);

    // Top RGB Diffuser Lightbar
    const rgbGeom = new THREE.BoxGeometry(0.55, 9.2, 0.15);
    const rgbMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: glowColor,
        emissive: glowColor,
        emissiveIntensity: 2.2,
        roughness: 0.1,
      })
    );
    emissiveMaterials.push(rgbMat);
    const rgbBar = new THREE.Mesh(rgbGeom, rgbMat);
    rgbBar.position.set(0.28, 0.6, 0);
    stick.add(rgbBar);

    return stick;
  };

  // Stick 1 in slot 2 (z = 4.45), Stick 2 in slot 4 (z = 6.95)
  const ram1 = createRamStick(4.45, 0x00f0ff);
  const ram2 = createRamStick(6.95, 0x9d00ff);
  ramGroup.add(ram1);
  ramGroup.add(ram2);

  tagObject(ramGroup, 'ram');
  rootGroup.add(ramGroup);

  // ==========================================
  // 5. GPU (Graphics Card - 3 Slot Monster)
  // ==========================================
  const gpuGroup = new THREE.Group();
  gpuGroup.name = 'GPU_Group';
  // Positioned plugged into PCIe slot 1
  gpuGroup.position.set(-1.0, -0.5, 3.5);

  // GPU Main PCB
  const gpuPcbGeom = new THREE.BoxGeometry(10.5, 0.28, 26.0);
  const gpuPcb = new THREE.Mesh(gpuPcbGeom, blackPlasticMat);
  gpuPcb.position.set(0, 0, 0);
  gpuGroup.add(gpuPcb);

  // PCIe Gold Connector (Plugs into Motherboard)
  const pcieConnGeom = new THREE.BoxGeometry(1.2, 0.8, 12.0);
  const pcieConn = new THREE.Mesh(pcieConnGeom, goldPinsMat);
  pcieConn.position.set(-4.8, 0.4, -4.5);
  gpuGroup.add(pcieConn);

  // Metal Backplate
  const backplateGeom = new THREE.BoxGeometry(10.2, 0.2, 25.6);
  const bpMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x232730,
      metalness: 0.9,
      roughness: 0.3,
      bumpMap: brushedMetalBump,
      bumpScale: 0.02,
    })
  );
  const backplate = new THREE.Mesh(backplateGeom, bpMat);
  backplate.position.set(0, 0.24, 0);
  gpuGroup.add(backplate);

  // Rear Triple-Slot Stainless Steel Bracket
  const bracketGeom = new THREE.BoxGeometry(4.2, 0.15, 6.2);
  const bracket = new THREE.Mesh(bracketGeom, aluminumFinsMat);
  bracket.position.set(0, 0, -13.1);
  bracket.rotation.x = Math.PI / 2;
  gpuGroup.add(bracket);

  // Massive Heatsink Fin Array inside
  const gpuSinkGeom = new THREE.BoxGeometry(9.6, 2.2, 24.5);
  const gpuSink = new THREE.Mesh(gpuSinkGeom, aluminumFinsMat);
  gpuSink.position.set(0, -1.2, 0);
  gpuGroup.add(gpuSink);

  // Cyberpunk Outer Shroud
  const shroudGeom = new THREE.BoxGeometry(10.4, 1.8, 26.2);
  const shroudMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x141820,
      metalness: 0.8,
      roughness: 0.35,
    })
  );
  const shroud = new THREE.Mesh(shroudGeom, shroudMat);
  shroud.position.set(0, -2.4, 0);
  gpuGroup.add(shroud);

  // Glowing Neon Side Emblem ("CYBER TITAN RTX")
  const gpuLogoGeom = new THREE.BoxGeometry(10.45, 0.35, 8.5);
  const gpuLogo = new THREE.Mesh(gpuLogoGeom, neonCyanMat);
  gpuLogo.position.set(0, -1.2, 0);
  gpuGroup.add(gpuLogo);

  // Dual Cooling Fans
  const gpuFan1 = createFanRotor(3.6, 9, 0x00f0ff);
  gpuFan1.position.set(0, -3.3, -5.5);
  gpuFan1.rotation.x = Math.PI / 2;
  gpuGroup.add(gpuFan1);

  const gpuFan2 = createFanRotor(3.6, 9, 0x9d00ff);
  gpuFan2.position.set(0, -3.3, 5.5);
  gpuFan2.rotation.x = Math.PI / 2;
  gpuGroup.add(gpuFan2);

  // 16-Pin 12VHPWR Power Connector on side
  const gpuPowerGeom = new THREE.BoxGeometry(1.6, 1.0, 2.2);
  const gpuPower = new THREE.Mesh(gpuPowerGeom, blackPlasticMat);
  gpuPower.position.set(4.8, -0.6, 8.5);
  gpuGroup.add(gpuPower);

  tagObject(gpuGroup, 'gpu');
  rootGroup.add(gpuGroup);

  // ==========================================
  // 6. M.2 NVMe SSD (Gen5 with Heatsink)
  // ==========================================
  const ssdGroup = new THREE.Group();
  ssdGroup.name = 'SSD_Group';
  // Positioned directly below CPU socket
  ssdGroup.position.set(-5.3, 0.5, 4.0);

  // M.2 2280 PCB
  const ssdPcbGeom = new THREE.BoxGeometry(0.12, 1.8, 7.8);
  const ssdPcb = new THREE.Mesh(ssdPcbGeom, blackPlasticMat);
  ssdGroup.add(ssdPcb);

  // Finned Aluminum Heatsink
  const ssdSinkGeom = new THREE.BoxGeometry(0.65, 2.2, 8.0);
  const ssdSinkMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x252a36,
      metalness: 0.95,
      roughness: 0.2,
      bumpMap: brushedMetalBump,
      bumpScale: 0.04,
    })
  );
  const ssdSink = new THREE.Mesh(ssdSinkGeom, ssdSinkMat);
  ssdSink.position.set(0.35, 0, 0);
  ssdGroup.add(ssdSink);

  // Neon status line
  const ssdNeonGeom = new THREE.BoxGeometry(0.08, 0.2, 6.5);
  const ssdNeon = new THREE.Mesh(ssdNeonGeom, neonVioletMat);
  ssdNeon.position.set(0.7, 0, 0);
  ssdGroup.add(ssdNeon);

  tagObject(ssdGroup, 'ssd');
  rootGroup.add(ssdGroup);

  // ==========================================
  // 7. POWER SUPPLY UNIT (PSU - 1000W Modular)
  // ==========================================
  const psuGroup = new THREE.Group();
  psuGroup.name = 'PSU_Group';
  // Positioned in lower chassis basement
  psuGroup.position.set(-2.5, -12.5, -4.5);

  // Steel Enclosure
  const psuCaseGeom = new THREE.BoxGeometry(13.5, 7.5, 14.5);
  const psuCase = new THREE.Mesh(psuCaseGeom, darkSteelMat);
  psuGroup.add(psuCase);

  // Rear Honeycomb Exhaust Grille
  const psuGrilleGeom = new THREE.PlaneGeometry(13.2, 7.2);
  const psuGrilleMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: honeycombTex,
      metalness: 0.8,
      roughness: 0.4,
    })
  );
  const psuGrille = new THREE.Mesh(psuGrilleGeom, psuGrilleMat);
  psuGrille.position.set(0, 0, -7.26);
  psuGrille.rotation.y = Math.PI;
  psuGroup.add(psuGrille);

  // AC Power Inlet & Rocker Switch
  const acInletGeom = new THREE.BoxGeometry(2.4, 1.8, 0.4);
  const acInlet = new THREE.Mesh(acInletGeom, blackPlasticMat);
  acInlet.position.set(3.5, 0, -7.35);
  psuGroup.add(acInlet);

  const switchGeom = new THREE.BoxGeometry(1.2, 1.5, 0.3);
  const switchMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.4 })
  );
  const psuSwitch = new THREE.Mesh(switchGeom, switchMat);
  psuSwitch.position.set(-3.5, 0, -7.35);
  psuGroup.add(psuSwitch);

  // Bottom 135mm Intake Cooling Fan
  const psuFanRotor = createFanRotor(3.8, 7, 0x00f0ff);
  psuFanRotor.position.set(0, -3.76, 0);
  psuFanRotor.rotation.x = -Math.PI / 2;
  psuGroup.add(psuFanRotor);

  // Modular Cable Ports on front face
  const modularBayGeom = new THREE.BoxGeometry(12.5, 6.2, 0.4);
  const modularBay = new THREE.Mesh(modularBayGeom, blackPlasticMat);
  modularBay.position.set(0, 0, 7.26);
  psuGroup.add(modularBay);

  // 1000W Platinum Badge
  const psuBadgeGeom = new THREE.BoxGeometry(3.5, 1.4, 0.1);
  const psuBadge = new THREE.Mesh(psuBadgeGeom, neonCyanMat);
  psuBadge.position.set(0, 2.0, 7.47);
  psuGroup.add(psuBadge);

  tagObject(psuGroup, 'psu');
  rootGroup.add(psuGroup);

  // ==========================================
  // 8. CASE (Mid-Tower Chassis & Glass Panel)
  // ==========================================
  const caseGroup = new THREE.Group();
  caseGroup.name = 'Case_Group';
  caseGroup.position.set(0, 0, 0);

  // Steel Chassis Outer Frame
  const chassisMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x161a22,
      metalness: 0.9,
      roughness: 0.4,
      bumpMap: brushedMetalBump,
      bumpScale: 0.02,
    })
  );

  // Chassis Steel Panels (Merged into 1 single Draw Call)
  const chassisGeoms: THREE.BufferGeometry[] = [];

  const rightPanelGeom = new THREE.BoxGeometry(0.4, 38.0, 36.0);
  rightPanelGeom.translate(-10.2, 0, 0);
  chassisGeoms.push(rightPanelGeom);

  const topPanelGeom = new THREE.BoxGeometry(18.5, 0.5, 36.0);
  topPanelGeom.translate(-1.0, 19.0, 0);
  chassisGeoms.push(topPanelGeom);

  const botPanelGeom = new THREE.BoxGeometry(18.5, 0.5, 36.0);
  botPanelGeom.translate(-1.0, -19.0, 0);
  chassisGeoms.push(botPanelGeom);

  const rearPanelGeom = new THREE.BoxGeometry(18.5, 38.0, 0.5);
  rearPanelGeom.translate(-1.0, 0, -18.0);
  chassisGeoms.push(rearPanelGeom);

  const psuShroudGeom = new THREE.BoxGeometry(18.0, 0.4, 35.5);
  psuShroudGeom.translate(-1.0, -8.5, 0);
  chassisGeoms.push(psuShroudGeom);

  caseGroup.add(new THREE.Mesh(mergeGeometriesSafely(chassisGeoms), chassisMat));

  // Front Panel Airflow Mesh
  const frontMeshGeom = new THREE.BoxGeometry(18.2, 37.5, 0.8);
  const frontMeshMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0f131a,
      map: honeycombTex,
      metalness: 0.85,
      roughness: 0.4,
    })
  );
  const frontMesh = new THREE.Mesh(frontMeshGeom, frontMeshMat);
  frontMesh.position.set(-1.0, 0, 18.2);
  caseGroup.add(frontMesh);

  // Front Intake Fans (Dual 140mm fans behind mesh)
  const frontFan1 = createFanRotor(4.6, 9, 0x00f0ff);
  frontFan1.position.set(-1.0, 6.0, 16.8);
  frontFan1.rotation.y = 0;
  caseGroup.add(frontFan1);

  const frontFan2 = createFanRotor(4.6, 9, 0x9d00ff);
  frontFan2.position.set(-1.0, -4.5, 16.8);
  frontFan2.rotation.y = 0;
  caseGroup.add(frontFan2);

  // 4 Rubber Non-slip Feet (Merged)
  const footMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x08090c, roughness: 0.9 })
  );
  const footPositions = [
    [-8.0, -19.6, -15.0],
    [6.0, -19.6, -15.0],
    [-8.0, -19.6, 15.0],
    [6.0, -19.6, 15.0],
  ];
  const feetGeoms: THREE.BufferGeometry[] = [];
  footPositions.forEach(([fx, fy, fz]) => {
    const fg = new THREE.CylinderGeometry(1.2, 1.2, 1.2, 12);
    fg.translate(fx, fy, fz);
    feetGeoms.push(fg);
  });
  caseGroup.add(new THREE.Mesh(mergeGeometriesSafely(feetGeoms), footMat));

  // Left Tempered Glass Side Panel (Separate mesh so exploded view can slide it out)
  const glassGeom = new THREE.BoxGeometry(0.35, 37.2, 35.5);
  const glassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x99ccff,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.45,
      transmission: 0.85,
      ior: 1.52,
      thickness: 0.8,
      depthWrite: false,
    })
  );
  const glassPanel = new THREE.Mesh(glassGeom, glassMat);
  glassPanel.position.set(8.2, 0, 0);
  caseGroup.add(glassPanel);

  // 4 Knurled Metal Glass Thumb Screws
  const screwGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.6, 16);
  const screwMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x778899,
      metalness: 0.95,
      roughness: 0.2,
    })
  );
  const screwPositions = [
    [8.4, 17.0, -16.0],
    [8.4, 17.0, 16.0],
    [8.4, -17.0, -16.0],
    [8.4, -17.0, 16.0],
  ];
  screwPositions.forEach(([sx, sy, sz]) => {
    const screw = new THREE.Mesh(screwGeom, screwMat);
    screw.position.set(sx, sy, sz);
    screw.rotation.z = Math.PI / 2;
    caseGroup.add(screw);
  });

  tagObject(caseGroup, 'case');
  rootGroup.add(caseGroup);

  return {
    rootGroup,
    componentGroups: {
      motherboard: mbGroup,
      cpu: cpuGroup,
      cooler: coolerGroup,
      ram: ramGroup,
      gpu: gpuGroup,
      ssd: ssdGroup,
      psu: psuGroup,
      case: caseGroup,
    },
    animatedFans,
    glassPanel,
    emissiveMaterials,
    allMaterials,
  };
}

/**
 * Builds the complete procedural 3D Laptop model (Cyber-Ultrabook).
 */
export function buildLaptopSystem(): BuiltPcSystem {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CyberLaptop_System';

  const animatedFans: THREE.Group[] = [];
  const emissiveMaterials: THREE.MeshStandardMaterial[] = [];
  const allMaterials: THREE.Material[] = [];

  const trackMat = <T extends THREE.Material>(mat: T): T => {
    allMaterials.push(mat);
    return mat;
  };

  const brushedMetalTex = createBrushedMetalTexture();
  const screenTex = createLaptopScreenTexture();
  const keyboardTex = createKeyboardTexture();
  const { colorMap: mbColor, bumpMap: mbBump, emissiveMap: mbEmissive } = createMotherboardTextures();

  const alloyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1a212d,
      map: brushedMetalTex,
      metalness: 0.88,
      roughness: 0.28,
    })
  );

  const darkPanMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0e131b,
      metalness: 0.9,
      roughness: 0.35,
    })
  );

  const copperMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc87d55,
      metalness: 0.92,
      roughness: 0.22,
    })
  );

  const tagObject = (obj: THREE.Object3D, id: ComponentId, castShadow = false) => {
    obj.userData = { componentId: id };
    obj.traverse((child) => {
      child.userData = { componentId: id };
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = castShadow;
      }
    });
  };

  // Helper for small centrifugal blower fan
  const createBlowerFan = (radius: number, glowColor = 0x00f0ff): THREE.Group => {
    const fan = new THREE.Group();
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, 0.4, 16),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x141820, metalness: 0.8, roughness: 0.3 }))
    );
    fan.add(hub);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.42, 0.04, 8, 24),
      trackMat(new THREE.MeshStandardMaterial({ color: glowColor, emissive: glowColor, emissiveIntensity: 2.0 }))
    );
    emissiveMaterials.push(ring.material as THREE.MeshStandardMaterial);
    fan.add(ring);

    const bladeGeoms: THREE.BufferGeometry[] = [];
    for (let b = 0; b < 13; b++) {
      const bg = new THREE.BoxGeometry(radius * 0.5, 0.35, 0.08);
      bg.translate(radius * 0.65, 0, 0);
      bg.rotateY((Math.PI * 2 * b) / 13);
      bladeGeoms.push(bg);
    }
    const bladeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0b0e14, roughness: 0.4 }));
    fan.add(new THREE.Mesh(mergeGeometriesSafely(bladeGeoms), bladeMat));
    animatedFans.push(fan);
    return fan;
  };

  // 1. LAPTOP CASE (Bottom Chassis + Palmrest & Keyboard)
  const caseGroup = new THREE.Group();
  caseGroup.name = 'Laptop_Case';

  const bottomPan = new THREE.Mesh(new THREE.BoxGeometry(22, 0.45, 15), darkPanMat);
  bottomPan.position.set(0, -0.65, 0);
  caseGroup.add(bottomPan);

  const topDeck = new THREE.Mesh(new THREE.BoxGeometry(22, 0.35, 15), alloyMat);
  topDeck.position.set(0, 0.15, 0);
  caseGroup.add(topDeck);

  const kbPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(17.5, 7.2),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: keyboardTex,
        roughness: 0.6,
      })
    )
  );
  kbPlane.rotation.x = -Math.PI / 2;
  kbPlane.position.set(0, 0.33, -2.6);
  caseGroup.add(kbPlane);

  // Interactive 3D Keycaps Grid with Individual Character Labels
  const laptopKeys = new Map<string, THREE.Mesh>();
  const keysGroup = new THREE.Group();
  keysGroup.name = 'Laptop_Keys_Interactive';
  keysGroup.position.set(0, 0.34, -2.6);

  const createKeyLabelTexture = (char: string): THREE.CanvasTexture => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#111624';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, 58, 58);
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00f0ff';
    const label = char.length > 5 ? char.slice(0, 4) : char;
    ctx.fillText(label, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const keyRows: { char: string; width: number }[][] = [
    [
      { char: 'ESC', width: 0.9 }, { char: 'F1', width: 0.8 }, { char: 'F2', width: 0.8 }, { char: 'F3', width: 0.8 },
      { char: 'F4', width: 0.8 }, { char: 'F5', width: 0.8 }, { char: 'F6', width: 0.8 }, { char: 'F7', width: 0.8 },
      { char: 'F8', width: 0.8 }, { char: 'F9', width: 0.8 }, { char: 'F10', width: 0.8 }, { char: 'F11', width: 0.8 },
      { char: 'F12', width: 0.8 }, { char: 'DEL', width: 0.9 }
    ],
    [
      { char: '`', width: 0.85 }, { char: '1', width: 0.85 }, { char: '2', width: 0.85 }, { char: '3', width: 0.85 },
      { char: '4', width: 0.85 }, { char: '5', width: 0.85 }, { char: '6', width: 0.85 }, { char: '7', width: 0.85 },
      { char: '8', width: 0.85 }, { char: '9', width: 0.85 }, { char: '0', width: 0.85 }, { char: '-', width: 0.85 },
      { char: '=', width: 0.85 }, { char: 'BACKSPACE', width: 1.8 }
    ],
    [
      { char: 'TAB', width: 1.3 }, { char: 'Q', width: 0.85 }, { char: 'W', width: 0.85 }, { char: 'E', width: 0.85 },
      { char: 'R', width: 0.85 }, { char: 'T', width: 0.85 }, { char: 'Y', width: 0.85 }, { char: 'U', width: 0.85 },
      { char: 'I', width: 0.85 }, { char: 'O', width: 0.85 }, { char: 'P', width: 0.85 }, { char: '[', width: 0.85 },
      { char: ']', width: 0.85 }, { char: '\\', width: 1.35 }
    ],
    [
      { char: 'CAPS', width: 1.6 }, { char: 'A', width: 0.85 }, { char: 'S', width: 0.85 }, { char: 'D', width: 0.85 },
      { char: 'F', width: 0.85 }, { char: 'G', width: 0.85 }, { char: 'H', width: 0.85 }, { char: 'J', width: 0.85 },
      { char: 'K', width: 0.85 }, { char: 'L', width: 0.85 }, { char: ';', width: 0.85 }, { char: "'", width: 0.85 },
      { char: 'ENTER', width: 2.1 }
    ],
    [
      { char: 'SHIFT', width: 2.1 }, { char: 'Z', width: 0.85 }, { char: 'X', width: 0.85 }, { char: 'C', width: 0.85 },
      { char: 'V', width: 0.85 }, { char: 'B', width: 0.85 }, { char: 'N', width: 0.85 }, { char: 'M', width: 0.85 },
      { char: ',', width: 0.85 }, { char: '.', width: 0.85 }, { char: '/', width: 0.85 }, { char: 'RSHIFT', width: 2.3 }
    ],
    [
      { char: 'CTRL', width: 1.3 }, { char: 'FN', width: 0.85 }, { char: 'WIN', width: 0.85 }, { char: 'ALT', width: 1.05 },
      { char: 'SPACE', width: 5.4 }, { char: 'RALT', width: 1.05 }, { char: 'RCTRL', width: 1.05 },
      { char: 'LEFT', width: 0.8 }, { char: 'UP', width: 0.8 }, { char: 'DOWN', width: 0.8 }, { char: 'RIGHT', width: 0.8 }
    ]
  ];

  const zStart = -2.6;
  keyRows.forEach((row, rIdx) => {
    const rz = zStart + rIdx * 1.02;
    const rowTotalW = row.reduce((sum, k) => sum + k.width + 0.16, 0) - 0.16;
    let curX = -rowTotalW / 2;

    row.forEach((k) => {
      const kw = k.width;
      const kd = rIdx === 0 ? 0.62 : 0.86;
      const kx = curX + kw / 2;
      curX += kw + 0.16;

      const keyGeo = new THREE.BoxGeometry(kw, 0.11, kd);
      const keyTex = createKeyLabelTexture(k.char);
      const keyMat = trackMat(
        new THREE.MeshStandardMaterial({
          map: keyTex,
          color: 0x141a29,
          roughness: 0.45,
          metalness: 0.2,
          emissive: 0x00f0ff,
          emissiveIntensity: 0.25,
        })
      );
      emissiveMaterials.push(keyMat);

      const keyMesh = new THREE.Mesh(keyGeo, keyMat);
      keyMesh.position.set(kx, 0.055, rz);
      keyMesh.userData = {
        isLaptopKey: true,
        keyChar: k.char,
        originalY: 0.055,
      };
      keysGroup.add(keyMesh);
      laptopKeys.set(k.char.toUpperCase(), keyMesh);
    });
  });
  caseGroup.add(keysGroup);

  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 0.06, 4.4),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x222a38, metalness: 0.6, roughness: 0.2 }))
  );
  trackpad.position.set(0, 0.34, 4.2);
  trackpad.userData = { isLaptopTrackpad: true };
  caseGroup.add(trackpad);

  const tpBorder = new THREE.Mesh(
    new THREE.BoxGeometry(6.75, 0.04, 4.55),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 1.5 }))
  );
  tpBorder.position.set(0, 0.33, 4.2);
  emissiveMaterials.push(tpBorder.material as THREE.MeshStandardMaterial);
  caseGroup.add(tpBorder);

  tagObject(caseGroup, 'case', true);
  rootGroup.add(caseGroup);

  // 2. BATTERY (4-cell Li-Polymer Pack)
  const batteryGroup = new THREE.Group();
  batteryGroup.name = 'Laptop_Battery';
  batteryGroup.position.set(0, -0.2, 4.0);

  const cellMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f2b20, roughness: 0.5, metalness: 0.3 }));
  const cellGeoms: THREE.BufferGeometry[] = [];
  [-7.35, -2.45, 2.45, 7.35].forEach((cx) => {
    const cg = new THREE.BoxGeometry(4.7, 0.45, 4.8);
    cg.translate(cx, 0, 0);
    cellGeoms.push(cg);
  });
  batteryGroup.add(new THREE.Mesh(mergeGeometriesSafely(cellGeoms), cellMat));

  tagObject(batteryGroup, 'battery', false);
  rootGroup.add(batteryGroup);

  // 3. MOTHERBOARD (Integrated High-Density Mobile PCB)
  const mbGroup = new THREE.Group();
  mbGroup.name = 'Laptop_Motherboard';
  mbGroup.position.set(0, -0.15, -2.5);

  const mbPcb = new THREE.Mesh(
    new THREE.BoxGeometry(20.4, 0.2, 8.4),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: mbColor,
        bumpMap: mbBump,
        emissiveMap: mbEmissive,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        metalness: 0.6,
        roughness: 0.4,
      })
    )
  );
  mbGroup.add(mbPcb);

  tagObject(mbGroup, 'motherboard', false);
  rootGroup.add(mbGroup);

  // 4. CPU (Mobile APU Bare Silicon Die)
  const cpuGroup = new THREE.Group();
  cpuGroup.name = 'Laptop_CPU';
  cpuGroup.position.set(-3.2, 0.15, -2.5);

  const cpuSubstrate = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.1, 3.6),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x14532d, metalness: 0.3 }))
  );
  cpuGroup.add(cpuSubstrate);

  const siliconDie = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.12, 1.8),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x2d3748,
        metalness: 0.98,
        roughness: 0.05,
        emissive: 0xff3b00,
        emissiveIntensity: 0.1,
      })
    )
  );
  siliconDie.position.set(0, 0.08, 0);
  siliconDie.userData = { isCpuDie: true };
  emissiveMaterials.push(siliconDie.material as THREE.MeshStandardMaterial);
  cpuGroup.add(siliconDie);

  tagObject(cpuGroup, 'cpu', false);
  rootGroup.add(cpuGroup);

  // 5. COOLER (Dual Blower Fans + Vapor Chamber Heatpipes)
  const coolerGroup = new THREE.Group();
  coolerGroup.name = 'Laptop_Cooler';
  coolerGroup.position.set(0, 0.35, -2.5);

  const coldplate = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 3.8), copperMat);
  coldplate.position.set(-3.2, 0, 0);
  coolerGroup.add(coldplate);

  const pipeL = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.12, 0.6), copperMat);
  pipeL.position.set(-5.6, 0.05, -1.2);
  coolerGroup.add(pipeL);

  const pipeR = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.12, 0.6), copperMat);
  pipeR.position.set(2.4, 0.05, -1.2);
  coolerGroup.add(pipeR);

  const blowerL = createBlowerFan(2.1, 0x00f0ff);
  blowerL.position.set(-8.0, 0.1, -1.8);
  coolerGroup.add(blowerL);

  const blowerR = createBlowerFan(2.1, 0x9d00ff);
  blowerR.position.set(8.0, 0.1, -1.8);
  coolerGroup.add(blowerR);

  tagObject(coolerGroup, 'cooler', false);
  rootGroup.add(coolerGroup);

  // 6. RAM (Soldered LPDDR5 Memory BGA Chips)
  const ramGroup = new THREE.Group();
  ramGroup.name = 'Laptop_RAM';
  ramGroup.position.set(3.2, 0.15, -1.2);

  const ramSpread = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.12, 2.4),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.2,
      })
    )
  );
  ramSpread.userData = { isLaptopRam: true };
  emissiveMaterials.push(ramSpread.material as THREE.MeshStandardMaterial);
  ramGroup.add(ramSpread);

  tagObject(ramGroup, 'ram', false);
  rootGroup.add(ramGroup);

  // 7. SSD (M.2 NVMe SSD 2280 Module)
  const ssdGroup = new THREE.Group();
  ssdGroup.name = 'Laptop_SSD';
  ssdGroup.position.set(4.5, 0.15, -3.8);

  const ssdPcb = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.08, 2.0),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x1b4332, metalness: 0.2 }))
  );
  ssdGroup.add(ssdPcb);

  const ssdFoil = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.06, 1.8),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xc87d55, metalness: 0.9, roughness: 0.2 }))
  );
  ssdFoil.position.set(0.4, 0.08, 0);
  ssdGroup.add(ssdFoil);

  tagObject(ssdGroup, 'ssd', false);
  rootGroup.add(ssdGroup);

  // 8. DISPLAY & HINGE ASSEMBLY (16" OLED Display Lid)
  const displayGroup = new THREE.Group();
  displayGroup.name = 'Laptop_Display';

  const hingeGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.6, 16);
  hingeGeo.rotateZ(Math.PI / 2);
  const hingeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 }));
  const hingeL = new THREE.Mesh(hingeGeo, hingeMat);
  hingeL.position.set(-8.0, 0.45, -7.1);
  displayGroup.add(hingeL);
  const hingeR = new THREE.Mesh(hingeGeo, hingeMat);
  hingeR.position.set(8.0, 0.45, -7.1);
  displayGroup.add(hingeR);

  // Hinge pivot group: Rotates the display lid backwards
  const laptopHinge = new THREE.Group();
  laptopHinge.position.set(0, 0.45, -7.1);
  laptopHinge.rotation.x = -Math.PI * 0.38; // 112 degrees open angle

  const lidCover = new THREE.Mesh(new THREE.BoxGeometry(22, 14.6, 0.35), alloyMat);
  lidCover.position.set(0, 7.3, 0);
  laptopHinge.add(lidCover);

  const screenPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(21.0, 13.6),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: screenTex,
        emissiveMap: screenTex,
        emissive: 0xffffff,
        emissiveIntensity: 1.25,
        roughness: 0.1,
      })
    )
  );
  screenPanel.position.set(0, 7.3, 0.22);
  emissiveMaterials.push(screenPanel.material as THREE.MeshStandardMaterial);
  laptopHinge.add(screenPanel);

  displayGroup.add(laptopHinge);

  tagObject(displayGroup, 'display', true);
  rootGroup.add(displayGroup);

  return {
    rootGroup,
    componentGroups: {
      case: caseGroup,
      battery: batteryGroup,
      motherboard: mbGroup,
      cpu: cpuGroup,
      cooler: coolerGroup,
      ram: ramGroup,
      ssd: ssdGroup,
      display: displayGroup,
    },
    animatedFans,
    laptopHinge,
    emissiveMaterials,
    allMaterials,
    screenMesh: screenPanel,
    cpuDieMesh: siliconDie,
    ramMesh: ramSpread,
    trackpadMesh: trackpad,
    laptopKeys,
  };
}

/**
 * Builds the complete procedural 3D Mini-PC model (NUC Cyber-Node).
 */
export function buildMiniPcSystem(): BuiltPcSystem {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CyberMiniPC_System';

  const animatedFans: THREE.Group[] = [];
  const emissiveMaterials: THREE.MeshStandardMaterial[] = [];
  const allMaterials: THREE.Material[] = [];

  const trackMat = <T extends THREE.Material>(mat: T): T => {
    allMaterials.push(mat);
    return mat;
  };

  const brushedMetalTex = createBrushedMetalTexture();
  const honeycombTex = createHoneycombTexture();
  const cpuIhsTex = createCpuIhsTexture();
  const { colorMap: mbColor, bumpMap: mbBump, emissiveMap: mbEmissive } = createMotherboardTextures();

  const darkAlloyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x161b24,
      map: brushedMetalTex,
      metalness: 0.9,
      roughness: 0.3,
    })
  );

  const copperMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc87d55,
      metalness: 0.95,
      roughness: 0.2,
    })
  );

  const tagObject = (obj: THREE.Object3D, id: ComponentId, castShadow = false) => {
    obj.userData = { componentId: id };
    obj.traverse((child) => {
      child.userData = { componentId: id };
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = castShadow;
      }
    });
  };

  // Helper for radial intake fan
  const createFan = (radius: number): THREE.Group => {
    const fan = new THREE.Group();
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, 0.4, 16),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x111620, metalness: 0.8 }))
    );
    fan.add(hub);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.38, 0.05, 8, 24),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.0 }))
    );
    emissiveMaterials.push(ring.material as THREE.MeshStandardMaterial);
    fan.add(ring);

    const bladeGeoms: THREE.BufferGeometry[] = [];
    for (let b = 0; b < 9; b++) {
      const bg = new THREE.BoxGeometry(radius * 0.55, 0.3, 0.08);
      bg.translate(radius * 0.65, 0, 0);
      bg.rotateY((Math.PI * 2 * b) / 9);
      bladeGeoms.push(bg);
    }
    const bladeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0b0e14, roughness: 0.4 }));
    fan.add(new THREE.Mesh(mergeGeometriesSafely(bladeGeoms), bladeMat));
    animatedFans.push(fan);
    return fan;
  };

  // 1. MINI-PC CASE (4x4 Compact Aluminum Cube Enclosure)
  const caseGroup = new THREE.Group();
  caseGroup.name = 'MiniPC_Case';

  const chassisBox = new THREE.Mesh(new THREE.BoxGeometry(13.8, 8.2, 13.8), darkAlloyMat);
  chassisBox.position.set(0, 0, 0);
  caseGroup.add(chassisBox);

  const topMesh = new THREE.Mesh(
    new THREE.BoxGeometry(13.0, 0.2, 13.0),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: honeycombTex,
        metalness: 0.7,
        roughness: 0.4,
        transparent: true,
        opacity: 0.9,
      })
    )
  );
  topMesh.position.set(0, 4.2, 0);
  caseGroup.add(topMesh);

  const pwrRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.08, 8, 16),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.5 }))
  );
  pwrRing.position.set(-4.5, 0.5, 7.0);
  emissiveMaterials.push(pwrRing.material as THREE.MeshStandardMaterial);
  caseGroup.add(pwrRing);

  tagObject(caseGroup, 'case', true);
  rootGroup.add(caseGroup);

  // 2. POWER DAUGHTERBOARD (PSU DC-DC Regulation)
  const psuGroup = new THREE.Group();
  psuGroup.name = 'MiniPC_PSU';
  psuGroup.position.set(0, -3.2, -4.5);

  const psuPcb = new THREE.Mesh(
    new THREE.BoxGeometry(11.5, 0.2, 3.2),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x111e18, metalness: 0.4 }))
  );
  psuGroup.add(psuPcb);

  tagObject(psuGroup, 'psu', false);
  rootGroup.add(psuGroup);

  // 3. MOTHERBOARD (12x12 cm Compact Mini-ITX/NUC PCB)
  const mbGroup = new THREE.Group();
  mbGroup.name = 'MiniPC_Motherboard';
  mbGroup.position.set(0, -2.0, 0);

  const mbPcb = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 0.22, 11.8),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: mbColor,
        bumpMap: mbBump,
        emissiveMap: mbEmissive,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.4,
      })
    )
  );
  mbGroup.add(mbPcb);

  tagObject(mbGroup, 'motherboard', false);
  rootGroup.add(mbGroup);

  // 4. CPU (Central Socketed APU with IHS)
  const cpuGroup = new THREE.Group();
  cpuGroup.name = 'MiniPC_CPU';
  cpuGroup.position.set(0, -1.6, 0);

  const cpuIhs = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.25, 3.6),
    trackMat(new THREE.MeshStandardMaterial({ map: cpuIhsTex, metalness: 0.92, roughness: 0.2 }))
  );
  cpuIhs.rotation.y = Math.PI / 2;
  cpuGroup.add(cpuIhs);

  tagObject(cpuGroup, 'cpu', false);
  rootGroup.add(cpuGroup);

  // 5. COOLER (Radial Copper Heatsink + Top 90mm PWM Fan)
  const coolerGroup = new THREE.Group();
  coolerGroup.name = 'MiniPC_Cooler';
  coolerGroup.position.set(0, 1.6, 0);

  const radBlock = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.4, 8.5), copperMat);
  radBlock.position.set(0, -0.6, 0);
  coolerGroup.add(radBlock);

  const topFan = createFan(3.8);
  topFan.position.set(0, 0.8, 0);
  coolerGroup.add(topFan);

  tagObject(coolerGroup, 'cooler', false);
  rootGroup.add(coolerGroup);

  // 6. RAM (Dual Stacked SO-DIMM DDR5 Slots)
  const ramGroup = new THREE.Group();
  ramGroup.name = 'MiniPC_RAM';
  ramGroup.position.set(-3.8, 0.1, 2.0);

  const dimmMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1b4332, metalness: 0.4 }));
  const dimmGeoms: THREE.BufferGeometry[] = [];
  [-0.6, 0.6].forEach((yOff) => {
    const dg = new THREE.BoxGeometry(4.2, 0.15, 1.8);
    dg.translate(0, yOff, 0);
    dimmGeoms.push(dg);
  });
  ramGroup.add(new THREE.Mesh(mergeGeometriesSafely(dimmGeoms), dimmMat));

  tagObject(ramGroup, 'ram', false);
  rootGroup.add(ramGroup);

  // 7. SSD (Dual M.2 NVMe Drives with Heatsink)
  const ssdGroup = new THREE.Group();
  ssdGroup.name = 'MiniPC_SSD';
  ssdGroup.position.set(3.8, 0.1, 2.0);

  const ssdArmor = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.3, 1.8),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.9, roughness: 0.2 }))
  );
  ssdGroup.add(ssdArmor);

  tagObject(ssdGroup, 'ssd', false);
  rootGroup.add(ssdGroup);

  // 8. GPU / NPU (Discrete AI Accelerator Card)
  const gpuGroup = new THREE.Group();
  gpuGroup.name = 'MiniPC_GPU';
  gpuGroup.position.set(0, 0.1, -3.2);

  const gpuBoard = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.2, 3.2),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 }))
  );
  gpuGroup.add(gpuBoard);

  const gpuSpread = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 2.4), copperMat);
  gpuSpread.position.set(0, 0.15, 0);
  gpuGroup.add(gpuSpread);

  tagObject(gpuGroup, 'gpu', false);
  rootGroup.add(gpuGroup);

  return {
    rootGroup,
    componentGroups: {
      case: caseGroup,
      psu: psuGroup,
      motherboard: mbGroup,
      cpu: cpuGroup,
      cooler: coolerGroup,
      ram: ramGroup,
      ssd: ssdGroup,
      gpu: gpuGroup,
    },
    animatedFans,
    emissiveMaterials,
    allMaterials,
  };
}

/**
 * Factory to build system model based on selected DeviceType.
 */
export function buildSystemForDevice(deviceType: DeviceType): BuiltPcSystem {
  switch (deviceType) {
    case 'laptop':
      return buildLaptopSystem();
    case 'minipc':
      return buildMiniPcSystem();
    case 'desktop':
    default:
      return buildDesktopSystem();
  }
}

export const buildPcSystem = buildDesktopSystem;

