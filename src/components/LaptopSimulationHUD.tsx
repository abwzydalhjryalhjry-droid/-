import React, { useState } from 'react';
import { SimulationStepData } from '../three/laptopSimulation';

interface LaptopSimulationHUDProps {
  stepData: SimulationStepData | null;
  onSimulateKey: (char: string) => void;
}

export const LaptopSimulationHUD: React.FC<LaptopSimulationHUDProps> = ({
  stepData,
  onSimulateKey,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If no key pressed yet, show welcoming prompt
  const currentKey = stepData?.keyChar || 'A';
  const stepNumber = stepData?.stepNumber || 1;
  const stageTitle = stepData?.stageTitleAr || 'محاكاة رحلة البيانات الحية (Live Keystroke Simulation)';
  const stageDesc =
    stepData?.stageDescAr ||
    'انقر على أي مفتاح في كيبورد اللابتوب 3D أو اكتب على لوحة مفاتيحك لمشاهدة رحلة الإشارة الكهربائية الفورية!';
  const hardwareStage = stepData?.hardwareStage || 'Ready · Hardware Matrix Scanner Active';
  const latency = stepData?.latencyMs ? `${stepData.latencyMs.toFixed(1)} ms` : '< 1.5 ms';

  return (
    <aside aria-label="لوحة المحاكاة الحية للابتوب" className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl pointer-events-auto transition-all duration-300">
      <div className="bg-[#070b14]/90 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.18)] p-3 md:p-4 text-slate-100 font-sans">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400">
              ⚡ LIVE LAPTOP HARDWARE PIPELINE
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {hardwareStage}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              زمن الاستجابة: {latency}
            </span>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'توسيع' : 'طي'}
            >
              {isCollapsed ? '▾ توسيع' : '▴ طي'}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="pt-2.5 space-y-3">
            {/* 4 Pipeline Stages */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs font-mono">
              <div
                className={`p-1.5 rounded-lg border transition-all ${
                  stepNumber === 1
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">1. اللمس</div>
                <div className="text-[9px] text-slate-400 truncate">مصفوفة المفتاح [{currentKey}]</div>
              </div>

              <div
                className={`p-1.5 rounded-lg border transition-all ${
                  stepNumber === 2
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">2. النقل</div>
                <div className="text-[9px] text-slate-400 truncate">مسار اللوحة الأم</div>
              </div>

              <div
                className={`p-1.5 rounded-lg border transition-all ${
                  stepNumber === 3
                    ? 'bg-orange-500/25 border-orange-400 text-orange-300 shadow-[0_0_12px_rgba(255,100,0,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">3. المعالجة</div>
                <div className="text-[9px] text-slate-400 truncate">المعالج والرام (APU)</div>
              </div>

              <div
                className={`p-1.5 rounded-lg border transition-all ${
                  stepNumber === 4
                    ? 'bg-violet-500/25 border-violet-400 text-violet-300 shadow-[0_0_12px_rgba(157,0,255,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">4. العرض</div>
                <div className="text-[9px] text-slate-400 truncate">شاشة اللابتوب eDP</div>
              </div>
            </div>

            {/* Current Active Step Explanation Card */}
            <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[11px] font-mono">
                    المفتاح: {currentKey}
                  </span>
                  <span>{stageTitle}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  {stageDesc}
                </p>
              </div>

              {/* Quick Sample Buttons */}
              <div className="flex flex-col gap-1 shrink-0">
                <div className="text-[9px] font-mono text-slate-400 text-center">أزرار سريعة:</div>
                <div className="flex gap-1">
                  {['A', 'W', 'S', 'D', 'SPACE', 'ENTER'].map((c) => (
                    <button
                      key={c}
                      onClick={() => onSimulateKey(c)}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-900 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-400 text-cyan-300 rounded transition-colors active:scale-95"
                    >
                      {c === 'SPACE' ? '␣' : c === 'ENTER' ? '↵' : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick interactive hint */}
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between px-1">
              <span>💡 يمكنك النقر المباشر على مفاتيح الكيبورد 3D، أو الكتابة على كيبورد جهازك، أو تحريك الماوس فوق التاتش باد.</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
