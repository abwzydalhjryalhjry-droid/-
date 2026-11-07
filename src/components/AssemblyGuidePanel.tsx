import React from 'react';
import { ComponentId, HardwareComponentId } from '../types';
import { HARDWARE_COMPONENTS, ASSEMBLY_SEQUENCE } from '../data/componentsData';
import {
  Wrench,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface AssemblyGuidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeSequence?: HardwareComponentId[];
  currentStep: number;
  onSetStep: (step: number) => void;
  installedComponents: Set<ComponentId>;
  onAssembleStep: (step: number) => void;
  onDisassembleStep: (step: number) => void;
  onAssembleAll: () => void;
  onDisassembleAll: () => void;
  selectedComponentId: ComponentId | null;
  onSelectComponent: (id: ComponentId) => void;
}

export const AssemblyGuidePanel: React.FC<AssemblyGuidePanelProps> = ({
  isOpen,
  onClose,
  activeSequence,
  currentStep,
  onSetStep,
  installedComponents,
  onAssembleStep,
  onDisassembleStep,
  onAssembleAll,
  onDisassembleAll,
  onSelectComponent,
}) => {
  if (!isOpen) return null;

  const seq = activeSequence || ASSEMBLY_SEQUENCE;
  const totalSteps = seq.length;
  const currentCompId = seq[currentStep - 1] || seq[0];
  const currentSpec = HARDWARE_COMPONENTS[currentCompId];
  const isCurrentInstalled = installedComponents.has(currentCompId);

  const completedCount = seq.filter((id) =>
    installedComponents.has(id)
  ).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="absolute top-16 left-4 sm:left-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-8.5rem)] bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 sm:p-5 text-slate-100 shadow-2xl shadow-cyan-950/50 flex flex-col z-25 overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>دليل التركيب التفاعلي</span>
              <span className="text-[11px] font-mono text-cyan-400">
                (Step-by-Step Guide)
              </span>
            </h2>
            <div className="text-[11px] text-slate-400 font-mono">
              التقدم: {completedCount} من {totalSteps} قطع مكتملة ({progressPercent}%)
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="إغلاق الدليل (Close)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="py-2.5">
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content Area (Scrollable Step Details + List) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2">
        {/* Active Step Highlight Card */}
        {currentSpec && (
          <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 shadow-inner space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">
                الخطوة {currentStep} من {totalSteps}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isCurrentInstalled
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isCurrentInstalled ? 'تم التثبيت ✓' : 'في انتظار التركيب'}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">
              {currentSpec.nameAr}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentSpec.assemblyInstructionAr}
            </p>

            {/* Pro Tip */}
            <div className="flex items-start gap-2 p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{currentSpec.assemblyTipAr}</span>
            </div>

            {/* Single Step Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {isCurrentInstalled ? (
                <button
                  onClick={() => onDisassembleStep(currentStep)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>فك هذه القطعة (Detach)</span>
                </button>
              ) : (
                <button
                  onClick={() => onAssembleStep(currentStep)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors shadow-sm shadow-emerald-500/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>تركيب القطعة الآن (Install)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Steps List (Numbered Sequence 1 to totalSteps) */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 mb-1">
            تسلسل خطوات التجميع المصنعي:
          </div>
          {seq.map((id, idx) => {
            const stepNum = idx + 1;
            const spec = HARDWARE_COMPONENTS[id];
            if (!spec) return null;
            const isInstalled = installedComponents.has(id);
            const isCurrent = currentStep === stepNum;

            return (
              <button
                key={id}
                onClick={() => {
                  onSetStep(stepNum);
                  onSelectComponent(id);
                }}
                className={`w-full text-right flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all border ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-white border-cyan-400 shadow-sm shadow-cyan-500/20'
                    : isInstalled
                    ? 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isCurrent
                        ? 'bg-cyan-400 text-slate-950'
                        : isInstalled
                        ? 'bg-emerald-900/80 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span>{spec.nameAr.split(' ')[0]} {spec.nameAr.split(' ')[1]}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isInstalled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation & Batch Controls */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        {/* Step Navigation Prev/Next */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onSetStep(Math.max(1, currentStep - 1))}
            disabled={currentStep <= 1}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-800 rounded-lg text-xs transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          <button
            onClick={() => onSetStep(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep >= totalSteps}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-800 rounded-lg text-xs transition-colors"
          >
            <span>التالي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Batch Assemble / Disassemble All Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAssembleAll}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-cyan-600/25 hover:bg-cyan-600/35 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>تجميع الكل (Assemble All)</span>
          </button>

          <button
            onClick={onDisassembleAll}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>تفكيك الكل (Explode All)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
