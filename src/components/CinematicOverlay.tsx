import React from 'react';
import { ComponentId } from '../types';
import { HARDWARE_COMPONENTS } from '../data/componentsData';
import { Film, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface CinematicOverlayProps {
  isActive: boolean;
  onExit: () => void;
  activeComponentId: ComponentId | null;
  onNext: () => void;
  onPrev: () => void;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({
  isActive,
  onExit,
  activeComponentId,
  onNext,
  onPrev,
}) => {
  if (!isActive) return null;

  const spec = activeComponentId ? HARDWARE_COMPONENTS[activeComponentId] : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between select-none">
      {/* Top Cinema Letterbox Bar */}
      <div className="w-full h-16 bg-gradient-to-b from-black/95 to-transparent px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <Film className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-mono tracking-widest font-bold">
            CINEMATIC DIRECTOR MODE · الجولة السينمائية الفلسفية
          </span>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>الخروج من السينما (ESC)</span>
        </button>
      </div>

      {/* Center Floating Human Analogy Spotlight Card */}
      {spec && (
        <div className="self-center max-w-2xl mx-4 p-5 sm:p-6 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 text-center pointer-events-auto transition-all animate-fadeIn">
          {/* Human Icon & Analogy Title */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
            <span className="text-base">{spec.humanIcon}</span>
            <span className="font-bold">{spec.humanAnalogyTitleAr}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{spec.humanAnalogyTitleEn}</span>
          </div>

          {/* Component Name */}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
            {spec.nameAr}
          </h2>

          {/* Human Analogy Deep Statement */}
          <p className="text-sm sm:text-base text-cyan-100 font-medium leading-relaxed max-w-xl mx-auto mb-3">
            « {spec.humanAnalogyAr} »
          </p>

          <p className="text-xs text-slate-400 italic font-sans max-w-lg mx-auto">
            {spec.humanAnalogyEn}
          </p>
        </div>
      )}

      {/* Bottom Cinema Letterbox Bar & Controls */}
      <div className="w-full h-20 bg-gradient-to-t from-black/95 to-transparent px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>تنتقل الكاميرا تلقائياً بين الأعضاء الحيوية كل 6 ثوانٍ</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
