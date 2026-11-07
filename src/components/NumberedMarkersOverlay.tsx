import React, { useEffect, useRef } from 'react';
import { ComponentId, HardwareComponentId } from '../types';
import { HARDWARE_COMPONENTS, ASSEMBLY_SEQUENCE } from '../data/componentsData';

interface NumberedMarkersOverlayProps {
  showNumbers: boolean;
  activeSequence?: HardwareComponentId[];
  selectedComponentId: ComponentId | null;
  onSelectComponent: (id: ComponentId) => void;
  currentAssemblyStep: number;
  isAssemblyMode: boolean;
  installedComponents: Set<ComponentId>;
  onRegisterMarkers: (elements: Map<ComponentId, HTMLElement>) => void;
}

export const NumberedMarkersOverlay: React.FC<NumberedMarkersOverlayProps> = ({
  showNumbers,
  activeSequence,
  selectedComponentId,
  onSelectComponent,
  currentAssemblyStep,
  isAssemblyMode,
  installedComponents,
  onRegisterMarkers,
}) => {
  const elementsRef = useRef<Map<ComponentId, HTMLElement>>(new Map());

  useEffect(() => {
    onRegisterMarkers(elementsRef.current);
  }, [onRegisterMarkers, activeSequence]);

  if (!showNumbers) return null;

  const seq = activeSequence || ASSEMBLY_SEQUENCE;
  const allItems: { id: ComponentId; order: number }[] = [
    ...seq.map((id, index) => ({ id, order: index + 1 })),
    { id: 'internet', order: seq.length + 1 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
      {allItems.map(({ id, order }) => {
        const spec = HARDWARE_COMPONENTS[id];
        if (!spec) return null;

        const isSelected = selectedComponentId === id;
        const isCurrentStep = isAssemblyMode && currentAssemblyStep === order;
        const isInstalled = installedComponents.has(id);

        return (
          <div
            key={id}
            ref={(el) => {
              if (el) elementsRef.current.set(id, el);
              else elementsRef.current.delete(id);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              willChange: 'transform',
              display: 'none',
            }}
            className="-translate-x-1/2 -translate-y-1/2 pointer-events-auto group"
          >
            <button
              onClick={() => onSelectComponent(id)}
              className={`relative flex items-center justify-center transition-transform duration-200 cursor-pointer ${
                isSelected
                  ? 'scale-125 z-30'
                  : isCurrentStep
                  ? 'scale-115 z-20'
                  : 'hover:scale-110 z-10'
              }`}
              title={`${order}. ${spec.nameAr}`}
            >
              {/* Outer Pulsing Aura for Current Guided Step */}
              {isCurrentStep && (
                <span className="absolute -inset-2 rounded-full border border-cyan-400 animate-ping opacity-75" />
              )}

              {/* Number Circle Badge */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs sm:text-sm border shadow-lg backdrop-blur-md transition-colors ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-white shadow-cyan-500/50'
                    : isCurrentStep
                    ? 'bg-purple-600 text-white border-cyan-300 shadow-purple-500/50'
                    : isInstalled
                    ? 'bg-slate-950/80 text-cyan-300 border-cyan-500/40 hover:border-cyan-300 hover:bg-slate-900'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}
              >
                {order}
              </div>

              {/* Tooltip on Hover / Current Step */}
              <div
                className={`absolute right-full mr-2 px-2.5 py-1 rounded-md bg-slate-950/95 border border-cyan-500/35 text-white text-[11px] whitespace-nowrap shadow-xl transition-opacity pointer-events-none flex items-center gap-1.5 ${
                  isSelected || isCurrentStep
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100 hidden sm:flex'
                }`}
              >
                <span>{spec.humanIcon}</span>
                <span className="font-semibold text-cyan-300">{spec.humanAnalogyTitleAr}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">{spec.nameAr.split(' ')[0]}</span>
                {isCurrentStep && (
                  <span className="text-[10px] text-purple-400 font-mono font-bold mr-1">
                    (الخطوة الحالية)
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};
