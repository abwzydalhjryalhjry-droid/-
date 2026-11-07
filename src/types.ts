export type DeviceType = 'desktop' | 'laptop' | 'minipc';

export type HardwareComponentId =
  | 'case'
  | 'psu'
  | 'motherboard'
  | 'cpu'
  | 'cooler'
  | 'ram'
  | 'ssd'
  | 'gpu'
  | 'battery'
  | 'display';

export type ComponentId = HardwareComponentId | 'internet';

export interface DeviceMetadata {
  id: DeviceType;
  nameAr: string;
  nameEn: string;
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
  cameraDefault: {
    position: [number, number, number];
    target: [number, number, number];
    minDistance: number;
    maxDistance: number;
  };
  assemblySequence: HardwareComponentId[];
}

export interface ComponentSpec {
  id: ComponentId;
  assemblyOrder: number; // Logical installation order (1 to 8)
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  humanAnalogyTitleAr: string;
  humanAnalogyTitleEn: string;
  humanAnalogyAr: string;
  humanAnalogyEn: string;
  humanIcon: string;
  assemblyInstructionAr: string;
  assemblyInstructionEn: string;
  assemblyTipAr: string;
  assemblyTipEn: string;
  keySpecs: { labelAr: string; labelEn: string; value: string }[];
  accentColor: string;
  explodedOffset: [number, number, number];
  centerOffset?: [number, number, number];
}

export interface CameraPreset {
  id: string;
  labelAr: string;
  labelEn: string;
  position: [number, number, number];
  target: [number, number, number];
}

export type FanSpeedMode = 'silent' | 'balanced' | 'turbo';

export interface ScreenMarker {
  id: ComponentId;
  order: number;
  nameAr: string;
  nameEn: string;
  humanTitleAr: string;
  humanIcon: string;
  x: number;
  y: number;
  visible: boolean;
  isInstalled: boolean;
  isCurrentStep: boolean;
}

export interface DataParticle {
  t: number; // 0.0 to 1.0 along the path
  speed: number;
  type: 'instruction' | 'data' | 'power' | 'internet';
  pathIndex: number;
}
