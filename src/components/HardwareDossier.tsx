import React from 'react';
import { HARDWARE_COMPONENTS } from '../data/componentsData';
import { ComponentId } from '../types';
import { X, ZoomIn, Layers } from 'lucide-react';

interface HardwareDossierProps {
  selectedId: ComponentId | null;
  onClose: () => void;
  onFocus: () => void;
}

export const HardwareDossier: React.FC<HardwareDossierProps> = ({
  selectedId,
  onClose,
  onFocus,
}) => {
  if (!selectedId) return null;
  const spec = HARDWARE_COMPONENTS[selectedId];
  if (!spec) return null;

  return (
    <div className="absolute top-16 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-10rem)] overflow-y-auto bg-slate-950/90 backdrop-blur-md border border-cyan-500/35 rounded-xl p-5 text-slate-100 shadow-2xl shadow-cyan-950/60 transition-all z-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <span>{spec.categoryAr}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">{spec.categoryEn}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 leading-tight">
            {spec.nameAr}
          </h2>
          <p className="text-xs text-slate-400 font-mono">{spec.nameEn}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="إغلاق (Close)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Human Analogy Spotlight (المقارنة الإنسانية العميقة) */}
      <div className="my-3 p-3 rounded-lg bg-gradient-to-r from-cyan-950/50 via-purple-950/30 to-slate-900/60 border border-cyan-500/30">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg">{spec.humanIcon}</span>
          <span className="text-xs font-bold text-cyan-300">
            {spec.humanAnalogyTitleAr}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({spec.humanAnalogyTitleEn})
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {spec.humanAnalogyAr}
        </p>
      </div>

      {/* Description */}
      <div className="py-2 text-xs text-slate-300 leading-relaxed border-b border-slate-800/80">
        <p className="mb-1.5">{spec.descriptionAr}</p>
        <p className="text-[11px] text-slate-400 font-sans italic">{spec.descriptionEn}</p>
      </div>

      {/* Key Technical Specifications Table */}
      <div className="py-3 space-y-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
          <Layers className="w-3.5 h-3.5" />
          <span>المواصفات التقنية الفائقة</span>
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          {spec.keySpecs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 border border-slate-800/50"
            >
              <div className="text-slate-400">
                <span>{item.labelAr}</span>
                <span className="text-slate-600 text-[10px] block font-sans">
                  {item.labelEn}
                </span>
              </div>
              <div className="text-right font-medium text-cyan-300 tabular-nums">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 flex items-center justify-between gap-2">
        <button
          onClick={onFocus}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>تقريب الكاميرا (Focus)</span>
        </button>
      </div>
    </div>
  );
};
