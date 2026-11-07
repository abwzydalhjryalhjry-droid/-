import { useEffect, useRef, useState } from 'react';
import { SceneManager } from './three/sceneManager';
import { HUD } from './components/HUD';
import { HardwareDossier } from './components/HardwareDossier';
import { AssemblyGuidePanel } from './components/AssemblyGuidePanel';
import { NumberedMarkersOverlay } from './components/NumberedMarkersOverlay';
import { CinematicOverlay } from './components/CinematicOverlay';
import { LaptopSimulationHUD } from './components/LaptopSimulationHUD';
import { ComponentId, FanSpeedMode, DeviceType } from './types';
import { SimulationStepData } from './three/laptopSimulation';
import { ASSEMBLY_SEQUENCE, DEVICE_CONFIGS } from './data/componentsData';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Active Device Selection
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');

  const [explodeFactor, setExplodeFactor] = useState(0.0);
  const [isAutoExploding, setIsAutoExploding] = useState(false);
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [fanSpeedMode, setFanSpeedMode] = useState<FanSpeedMode>('balanced');
  const [isTourActive, setIsTourActive] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<ComponentId | null>(null);

  // Educational Assembly Features
  const [isAssemblyGuideOpen, setIsAssemblyGuideOpen] = useState(false);
  const [currentAssemblyStep, setCurrentAssemblyStep] = useState(1);
  const [installedComponents, setInstalledComponents] = useState<Set<ComponentId>>(
    new Set(DEVICE_CONFIGS.desktop.assemblySequence)
  );
  const [showNumbers, setShowNumbers] = useState(true);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);

  // Data Flow & Cinematic Mode
  const [isDataFlowActive, setIsDataFlowActive] = useState(true);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [cinematicComponentId, setCinematicComponentId] = useState<ComponentId | null>(null);

  // Laptop Live Simulation Telemetry State
  const [laptopStepData, setLaptopStepData] = useState<SimulationStepData | null>(null);

  const activeSequence = DEVICE_CONFIGS[selectedDevice]?.assemblySequence || ASSEMBLY_SEQUENCE;

  // Initialize WebGL Scene Once
  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new SceneManager(mountRef.current, {
      onComponentSelect: (id) => {
        setSelectedComponentId(id);
        if (id && id !== 'internet') {
          const currentSeq = sceneManagerRef.current
            ? DEVICE_CONFIGS[sceneManagerRef.current.currentDevice]?.assemblySequence || ASSEMBLY_SEQUENCE
            : ASSEMBLY_SEQUENCE;
          const stepIndex = currentSeq.indexOf(id as any);
          if (stepIndex !== -1) {
            setCurrentAssemblyStep(stepIndex + 1);
          }
        }
      },
      onExplodeChange: (factor) => {
        setExplodeFactor(factor);
      },
      onAssemblyStepComplete: (id) => {
        setInstalledComponents((prev) => new Set([...prev, id]));
      },
      onCinematicStep: (id) => {
        setCinematicComponentId(id);
      },
      onLaptopStepChange: (data) => {
        setLaptopStepData(data);
      },
    });

    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Handlers for HUD controls
  const handleExplodeChange = (factor: number) => {
    setExplodeFactor(factor);
    setIsAutoExploding(false);
    sceneManagerRef.current?.setExplode(factor);
  };

  const handleToggleAutoExplode = () => {
    const next = !isAutoExploding;
    setIsAutoExploding(next);
    sceneManagerRef.current?.toggleAutoExplode();
  };

  const handleToggleXRay = () => {
    const next = !isXRayMode;
    setIsXRayMode(next);
    sceneManagerRef.current?.toggleXRay();
  };

  const handleFanSpeedChange = (mode: FanSpeedMode) => {
    setFanSpeedMode(mode);
    sceneManagerRef.current?.setFanSpeed(mode);
  };

  const handleToggleTour = () => {
    const next = !isTourActive;
    setIsTourActive(next);
    sceneManagerRef.current?.toggleTour();
  };

  const handleSelectDevice = (device: DeviceType) => {
    if (selectedDevice === device) return;
    setSelectedDevice(device);
    sceneManagerRef.current?.setDevice(device);
    const newSeq = DEVICE_CONFIGS[device]?.assemblySequence || ASSEMBLY_SEQUENCE;
    setInstalledComponents(new Set(newSeq));
    setCurrentAssemblyStep(1);
    setSelectedComponentId(null);
    setExplodeFactor(0.0);
    setIsAutoExploding(false);
  };

  const handleSelectComponent = (id: ComponentId | null) => {
    setSelectedComponentId(id);
    sceneManagerRef.current?.selectComponent(id);
    if (id && id !== 'internet') {
      const stepIndex = activeSequence.indexOf(id as any);
      if (stepIndex !== -1) {
        setCurrentAssemblyStep(stepIndex + 1);
      }
    }
  };

  const handleCameraPreset = (presetId: string) => {
    sceneManagerRef.current?.setCameraPreset(presetId);
  };

  const handleResetCamera = () => {
    sceneManagerRef.current?.setCameraPreset('iso');
    setSelectedComponentId(null);
    sceneManagerRef.current?.selectComponent(null);
  };

  const handleFocusOnSelected = () => {
    if (selectedComponentId) {
      sceneManagerRef.current?.selectComponent(selectedComponentId);
    }
  };

  // Assembly Guide Handlers
  const handleToggleAssemblyGuide = () => {
    const next = !isAssemblyGuideOpen;
    setIsAssemblyGuideOpen(next);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.isAssemblyMode = next;
      sceneManagerRef.current.currentAssemblyStep = currentAssemblyStep;
    }
  };

  const handleSetAssemblyStep = (step: number) => {
    setCurrentAssemblyStep(step);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.currentAssemblyStep = step;
    }
    const compId = activeSequence[step - 1];
    if (compId) {
      handleSelectComponent(compId);
    }
  };

  const handleAssembleStep = (step: number) => {
    sceneManagerRef.current?.assembleStep(step);
    const compId = activeSequence[step - 1];
    if (compId) {
      setInstalledComponents((prev) => new Set([...prev, compId]));
    }
  };

  const handleDisassembleStep = (step: number) => {
    sceneManagerRef.current?.disassembleStep(step);
    const compId = activeSequence[step - 1];
    if (compId) {
      setInstalledComponents((prev) => {
        const next = new Set(prev);
        next.delete(compId);
        return next;
      });
    }
  };

  const handleAssembleAll = () => {
    sceneManagerRef.current?.assembleAll();
    setInstalledComponents(new Set(activeSequence));
    setExplodeFactor(0.0);
  };

  const handleDisassembleAll = () => {
    sceneManagerRef.current?.disassembleAll();
    setInstalledComponents(new Set());
    setExplodeFactor(1.0);
  };

  const handleTogglePerformanceMode = () => {
    const next = !isPerformanceMode;
    setIsPerformanceMode(next);
    sceneManagerRef.current?.setPerformanceMode(next);
  };

  const handleToggleNumbers = () => {
    const next = !showNumbers;
    setShowNumbers(next);
    sceneManagerRef.current?.setShowNumbers(next);
  };

  const handleTogglePower = () => {
    sceneManagerRef.current?.togglePower();
    setIsPoweredOn((prev) => !prev);
  };

  const handleToggleDataFlow = () => {
    sceneManagerRef.current?.toggleDataFlow();
    setIsDataFlowActive((prev) => !prev);
  };

  const handleToggleCinematicMode = () => {
    const next = !isCinematicMode;
    setIsCinematicMode(next);
    sceneManagerRef.current?.toggleCinematicMode();
    if (next) {
      setCinematicComponentId('cpu');
    }
  };

  const handleExitCinematic = () => {
    setIsCinematicMode(false);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.isCinematicMode = false;
    }
  };

  // Download standalone single-file HTML
  const handleDownloadSingleFile = () => {
    const link = document.createElement('a');
    link.href = '/cyberpc_standalone.html';
    link.download = 'cyberpc_3d_exploded_view.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06080d] select-none font-sans" dir="rtl">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 z-0 touch-none"
      />

      {/* Screen-Anchored 3D Number Markers (1 to N) - Direct DOM GPU transformed */}
      {!isCinematicMode && (
        <NumberedMarkersOverlay
          showNumbers={showNumbers}
          activeSequence={activeSequence}
          selectedComponentId={selectedComponentId}
          onSelectComponent={handleSelectComponent}
          currentAssemblyStep={currentAssemblyStep}
          isAssemblyMode={isAssemblyGuideOpen}
          installedComponents={installedComponents}
          onRegisterMarkers={(elements) => {
            sceneManagerRef.current?.registerMarkerElements(elements);
          }}
        />
      )}

      {/* Cinematic Director Mode Overlay */}
      <CinematicOverlay
        isActive={isCinematicMode}
        onExit={handleExitCinematic}
        activeComponentId={cinematicComponentId}
        onNext={() => sceneManagerRef.current?.stepCinematic()}
        onPrev={() => sceneManagerRef.current?.stepCinematic()}
      />

      {/* Laptop Live Simulation Interactive Pipeline HUD */}
      {!isCinematicMode && selectedDevice === 'laptop' && (
        <LaptopSimulationHUD
          stepData={laptopStepData}
          onSimulateKey={(char) => sceneManagerRef.current?.laptopSimulation.triggerKeystroke(char)}
        />
      )}

      {/* Top Bar & Bottom Dock HUD (Hidden when in full cinematic mode) */}
      {!isCinematicMode && (
        <HUD
          selectedDevice={selectedDevice}
          onSelectDevice={handleSelectDevice}
          explodeFactor={explodeFactor}
          onExplodeChange={handleExplodeChange}
          isAutoExploding={isAutoExploding}
          onToggleAutoExplode={handleToggleAutoExplode}
          isXRayMode={isXRayMode}
          onToggleXRay={handleToggleXRay}
          fanSpeedMode={fanSpeedMode}
          onFanSpeedChange={handleFanSpeedChange}
          isTourActive={isTourActive}
          onToggleTour={handleToggleTour}
          selectedComponentId={selectedComponentId}
          onSelectComponent={handleSelectComponent}
          onCameraPreset={handleCameraPreset}
          onResetCamera={handleResetCamera}
          onDownloadSingleFile={handleDownloadSingleFile}
          isAssemblyGuideOpen={isAssemblyGuideOpen}
          onToggleAssemblyGuide={handleToggleAssemblyGuide}
          showNumbers={showNumbers}
          onToggleNumbers={handleToggleNumbers}
          isPoweredOn={isPoweredOn}
          onTogglePower={handleTogglePower}
          onAssembleAll={handleAssembleAll}
          onDisassembleAll={handleDisassembleAll}
          isDataFlowActive={isDataFlowActive}
          onToggleDataFlow={handleToggleDataFlow}
          isCinematicMode={isCinematicMode}
          onToggleCinematicMode={handleToggleCinematicMode}
          isPerformanceMode={isPerformanceMode}
          onTogglePerformanceMode={handleTogglePerformanceMode}
        />
      )}

      {/* Interactive Step-by-Step Assembly Guide Sidebar */}
      {!isCinematicMode && (
        <AssemblyGuidePanel
          isOpen={isAssemblyGuideOpen}
          onClose={() => {
            setIsAssemblyGuideOpen(false);
            if (sceneManagerRef.current) {
              sceneManagerRef.current.isAssemblyMode = false;
            }
          }}
          activeSequence={activeSequence}
          currentStep={currentAssemblyStep}
          onSetStep={handleSetAssemblyStep}
          installedComponents={installedComponents}
          onAssembleStep={handleAssembleStep}
          onDisassembleStep={handleDisassembleStep}
          onAssembleAll={handleAssembleAll}
          onDisassembleAll={handleDisassembleAll}
          selectedComponentId={selectedComponentId}
          onSelectComponent={handleSelectComponent}
        />
      )}

      {/* Hardware Component Dossier / Specs Sheet with Human Analogy */}
      {!isCinematicMode && (
        <HardwareDossier
          selectedId={selectedComponentId}
          onClose={() => handleSelectComponent(null)}
          onFocus={handleFocusOnSelected}
        />
      )}

      {/* Subtle interaction instructions toast */}
      {!isCinematicMode && (
        <div className="absolute bottom-24 sm:bottom-28 left-6 pointer-events-none hidden md:block z-10">
          <div className="text-[11px] font-mono text-slate-500 bg-slate-950/70 border border-slate-800/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <span>دوران: زر الفأرة الأيسر · تحريك: زر الفأرة الأيمن · تقريب: عجلة التمرير · انقر على أي رقم أو عضو للفحص</span>
          </div>
        </div>
      )}
    </div>
  );
}
