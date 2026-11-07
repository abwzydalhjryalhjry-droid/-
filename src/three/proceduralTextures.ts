import * as THREE from 'three';

let cachedMbTextures: {
  colorMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} | null = null;
let cachedBrushedMetal: THREE.CanvasTexture | null = null;
let cachedHoneycomb: THREE.CanvasTexture | null = null;
let cachedFanHub: THREE.CanvasTexture | null = null;
let cachedCpuIhs: THREE.CanvasTexture | null = null;
let cachedLaptopScreen: THREE.CanvasTexture | null = null;
let cachedKeyboard: THREE.CanvasTexture | null = null;

/**
 * Creates a procedural motherboard PCB texture with intricate circuit traces and solder pads.
 */
export function createMotherboardTextures(): {
  colorMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  if (cachedMbTextures) return cachedMbTextures;
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const eCtx = emissiveCanvas.getContext('2d')!;

  // Base PCB dark color
  ctx.fillStyle = '#0a1017';
  ctx.fillRect(0, 0, size, size);

  // Clear emissive
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  // Subtle grid on PCB
  ctx.strokeStyle = '#0e1824';
  ctx.lineWidth = 1;
  const gridStep = 32;
  for (let x = 0; x < size; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Draw procedural cyber circuit traces
  const drawTrace = (
    points: [number, number][],
    width = 2,
    color = '#c68c53',
    glowColor = '#00f0ff'
  ) => {
    if (points.length < 2) return;
    // Color context
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    // Emissive glow context
    eCtx.strokeStyle = glowColor;
    eCtx.lineWidth = width * 1.5;
    eCtx.lineCap = 'round';
    eCtx.lineJoin = 'round';
    eCtx.beginPath();
    eCtx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      eCtx.lineTo(points[i][0], points[i][1]);
    }
    eCtx.stroke();
  };

  // Generate dense realistic parallel bus lines
  // Bus 1: CPU socket to RAM slots
  for (let i = 0; i < 18; i++) {
    const yOff = 260 + i * 14;
    drawTrace(
      [
        [340, yOff],
        [440, yOff],
        [480, yOff - 60],
        [680, yOff - 60],
      ],
      1.5,
      i % 2 === 0 ? '#00f0ff' : '#d49b4b',
      i % 2 === 0 ? '#00f0ff' : '#9d00ff'
    );
  }

  // Bus 2: CPU socket to PCIe x16 slot
  for (let i = 0; i < 22; i++) {
    const xOff = 240 + i * 12;
    drawTrace(
      [
        [xOff, 480],
        [xOff, 540],
        [xOff - 60, 600],
        [xOff - 60, 720],
      ],
      1.5,
      i % 3 === 0 ? '#00f0ff' : '#cf9040',
      i % 3 === 0 ? '#00f0ff' : '#7928ca'
    );
  }

  // Solder pads and micro-vias
  for (let i = 0; i < 400; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    ctx.fillStyle = '#e6b358';
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();

    if (i % 6 === 0) {
      eCtx.fillStyle = '#00f0ff';
      eCtx.beginPath();
      eCtx.arc(px, py, 2.5, 0, Math.PI * 2);
      eCtx.fill();
    }
  }

  // Chipset branding
  ctx.fillStyle = '#657786';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('CYBER-Z790 BIO-SYNTH V3', 540, 840);
  ctx.fillText('128GB DDR5 6400MHz / PCIE 5.0', 540, 870);

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.wrapT = THREE.RepeatWrapping;

  // Bump map using canvas
  const bumpMap = new THREE.CanvasTexture(canvas);

  cachedMbTextures = { colorMap, emissiveMap, bumpMap };
  return cachedMbTextures;
}

/**
 * Creates brushed aluminum bump texture.
 */
export function createBrushedMetalTexture(): THREE.CanvasTexture {
  if (cachedBrushedMetal) return cachedBrushedMetal;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 3000; i++) {
    const y = Math.random() * 512;
    const x = Math.random() * 512;
    const len = 30 + Math.random() * 80;
    const gray = Math.floor(100 + Math.random() * 55);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(x, y, len, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  cachedBrushedMetal = texture;
  return texture;
}

/**
 * Creates honeycomb ventilation mesh texture with transparency for grilles.
 */
export function createHoneycombTexture(): THREE.CanvasTexture {
  if (cachedHoneycomb) return cachedHoneycomb;
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14171d';
  ctx.fillRect(0, 0, size, size);

  // Hexagonal pattern
  const r = 10;
  const h = r * Math.sqrt(3);

  ctx.fillStyle = '#05070a';
  for (let y = 0; y < size + h; y += h) {
    for (let x = 0; x < size + r * 3; x += r * 3) {
      // Hex 1
      drawHex(ctx, x, y, r * 0.75);
      // Hex 2 offset
      drawHex(ctx, x + r * 1.5, y + h / 2, r * 0.75);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  cachedHoneycomb = texture;
  return texture;
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + radius * Math.cos(angle);
    const hy = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Creates fan hub sticker texture with cyber neon graphics.
 */
export function createFanHubTexture(): THREE.CanvasTexture {
  if (cachedFanHub) return cachedFanHub;
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Background
  ctx.fillStyle = '#0d1117';
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fill();

  // Rings
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 105, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#9d00ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Center emblem
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CYBER', cx, cy - 10);
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px monospace';
  ctx.fillText('F-140 PWM', cx, cy + 14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedFanHub = texture;
  return texture;
}

/**
 * Creates laser engraved CPU IHS texture.
 */
export function createCpuIhsTexture(): THREE.CanvasTexture {
  if (cachedCpuIhs) return cachedCpuIhs;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c5ccd6';
  ctx.fillRect(0, 0, 512, 512);

  // Fine laser borders
  ctx.strokeStyle = '#8d98a6';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 452, 452);

  // Triangle pin 1 mark
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.lineTo(80, 40);
  ctx.lineTo(40, 80);
  ctx.closePath();
  ctx.fill();

  // Engraved text
  ctx.fillStyle = '#3a4454';
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('CYBER-9 9950X', 256, 180);

  ctx.font = 'bold 22px monospace';
  ctx.fillText('16-CORE / 32-THREAD / 5.7GHz', 256, 230);

  ctx.font = '18px monospace';
  ctx.fillText('AM5 SOCKET · DIFFUSED IN USA', 256, 280);

  // 2D Data matrix code
  ctx.fillStyle = '#222831';
  ctx.fillRect(206, 330, 100, 100);
  ctx.fillStyle = '#ffffff';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r + c) % 2 === 0) {
        ctx.fillRect(216 + c * 16, 340 + r * 16, 12, 12);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedCpuIhs = texture;
  return texture;
}

/**
 * Creates high-tech Cyberpunk laptop OLED screen texture with glowing telemetry HUD.
 */
export function createLaptopScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Deep obsidian cyber background with electric gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 640);
  grad.addColorStop(0, '#06080e');
  grad.addColorStop(0.5, '#0b1322');
  grad.addColorStop(1, '#05070c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);

  // Digital grid lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 640);
    ctx.stroke();
  }
  for (let y = 0; y < 640; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Futuristic center circle & waveforms
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(512, 300, 120, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#9d00ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(512, 300, 140, 0, Math.PI * 2);
  ctx.stroke();

  // Waveform inside circle
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 200; i++) {
    const x = 412 + i;
    const y = 300 + Math.sin(i * 0.12) * 35 * Math.sin(i * 0.03);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Top system status bar
  ctx.fillStyle = 'rgba(11, 19, 34, 0.85)';
  ctx.fillRect(0, 0, 1024, 40);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.strokeRect(0, 0, 1024, 40);

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('⚡ CYBER-OS 4.2 · QUANTUM NEURAL KERNEL', 24, 25);

  ctx.textAlign = 'right';
  ctx.fillText('CORE: 16 | RAM: 64GB | WI-FI 7: 10 Gbps | BATT: 100% ⚡', 1000, 25);

  // Bottom telemetry widget cards
  ctx.fillStyle = 'rgba(10, 15, 24, 0.85)';
  ctx.fillRect(80, 480, 260, 120);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.strokeRect(80, 480, 260, 120);
  ctx.fillStyle = '#00f0ff';
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('CPU CLUSTER · 5.7 GHz', 100, 510);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText('TEMP: 42°C · LOAD: 14%', 100, 540);
  ctx.fillText('VOLTAGE: 1.15V STABLE', 100, 570);

  ctx.fillStyle = 'rgba(10, 15, 24, 0.85)';
  ctx.fillRect(684, 480, 260, 120);
  ctx.strokeStyle = 'rgba(157, 0, 255, 0.4)';
  ctx.strokeRect(684, 480, 260, 120);
  ctx.fillStyle = '#9d00ff';
  ctx.fillText('AI NPU TENSOR ENGINE', 704, 510);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('STATUS: ONLINE · 120 TOPS', 704, 540);
  ctx.fillText('SYNAPSE BUS: 800 GB/s', 704, 570);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedLaptopScreen = texture;
  return texture;
}

/**
 * Creates laptop keyboard keycaps layout texture.
 */
export function createKeyboardTexture(): THREE.CanvasTexture {
  if (cachedKeyboard) return cachedKeyboard;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 420;
  const ctx = canvas.getContext('2d')!;

  // Keyboard tray dark matte background
  ctx.fillStyle = '#11151c';
  ctx.fillRect(0, 0, 1024, 420);

  // Keycap grid (6 rows)
  const rows = 6;
  const cols = 15;
  const keyW = 60;
  const keyH = 55;
  const padX = 8;
  const padY = 8;
  const startX = 20;
  const startY = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (keyW + padX);
      const y = startY + r * (keyH + padY);

      // Spacebar special key
      if (r === 5 && c >= 4 && c <= 9) {
        if (c === 4) {
          ctx.fillStyle = '#1c2330';
          ctx.fillRect(x, y, (keyW + padX) * 6 - padX, keyH);
          ctx.strokeStyle = '#2b3648';
          ctx.strokeRect(x, y, (keyW + padX) * 6 - padX, keyH);
        }
        continue;
      }

      ctx.fillStyle = '#181e28';
      ctx.fillRect(x, y, keyW, keyH);
      ctx.strokeStyle = '#283244';
      ctx.strokeRect(x, y, keyW, keyH);

      // Keycap neon font symbol
      ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${String.fromCharCode(65 + ((r * 15 + c) % 26))}`, x + keyW / 2, y + keyH / 2 + 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedKeyboard = texture;
  return texture;
}

/**
 * Disposes all cached procedural CanvasTextures to free GPU VRAM on teardown.
 */
export function disposeCachedTextures() {
  if (cachedMbTextures) {
    cachedMbTextures.colorMap.dispose();
    cachedMbTextures.emissiveMap.dispose();
    cachedMbTextures.bumpMap.dispose();
    cachedMbTextures = null;
  }
  if (cachedBrushedMetal) {
    cachedBrushedMetal.dispose();
    cachedBrushedMetal = null;
  }
  if (cachedHoneycomb) {
    cachedHoneycomb.dispose();
    cachedHoneycomb = null;
  }
  if (cachedFanHub) {
    cachedFanHub.dispose();
    cachedFanHub = null;
  }
  if (cachedCpuIhs) {
    cachedCpuIhs.dispose();
    cachedCpuIhs = null;
  }
  if (cachedLaptopScreen) {
    cachedLaptopScreen.dispose();
    cachedLaptopScreen = null;
  }
  if (cachedKeyboard) {
    cachedKeyboard.dispose();
    cachedKeyboard = null;
  }
}
