import React, { useState } from 'react';
import { ComponentId, FanSpeedMode, DeviceType } from '../types';
import { CAMERA_PRESETS, HARDWARE_COMPONENTS, ASSEMBLY_SEQUENCE, DEVICE_CONFIGS } from '../data/componentsData';
import {
  Maximize2,
  Wind,
  Eye,
  Compass,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Wrench,
  Hash,
  Power,
  Activity,
  Film,
  Globe,
  RotateCcw,
  Zap,
  Monitor,
  Laptop,
  Server,
} from 'lucide-react';

interface HUDProps {
  // Device Selection
  selectedDevice: DeviceType;
  onSelectDevice: (device: DeviceType) => void;

  explodeFactor: number;
  onExplodeChange: (factor: number) => void;
  isAutoExploding: boolean;
  onToggleAutoExplode: () => void;
  isXRayMode: boolean;
  onToggleXRay: () => void;
  fanSpeedMode: FanSpeedMode;
  onFanSpeedChange: (mode: FanSpeedMode) => void;
  isTourActive: boolean;
  onToggleTour: () => void;
  selectedComponentId: ComponentId | null;
  onSelectComponent: (id: ComponentId | null) => void;
  onCameraPreset: (presetId: string) => void;
  onResetCamera: () => void;
  onDownloadSingleFile: () => void;

  // Assembly & Power
  isAssemblyGuideOpen: boolean;
  onToggleAssemblyGuide: () => void;
  showNumbers: boolean;
  onToggleNumbers: () => void;
  isPoweredOn: boolean;
  onTogglePower: () => void;
  onAssembleAll: () => void;
  onDisassembleAll: () => void;

  // Data Flow & Cinematic Mode
  isDataFlowActive: boolean;
  onToggleDataFlow: () => void;
  isCinematicMode: boolean;
  onToggleCinematicMode: () => void;

  // Performance 60 FPS Profile
  isPerformanceMode: boolean;
  onTogglePerformanceMode: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  selectedDevice,
  onSelectDevice,
  explodeFactor,
  onExplodeChange,
  isAutoExploding,
  onToggleAutoExplode,
  isXRayMode,
  onToggleXRay,
  fanSpeedMode,
  onFanSpeedChange,
  isTourActive,
  onToggleTour,
  selectedComponentId,
  onSelectComponent,
  onCameraPreset,
  onResetCamera,
  onDownloadSingleFile,
  isAssemblyGuideOpen,
  onToggleAssemblyGuide,
  showNumbers,
  onToggleNumbers,
  isPoweredOn,
  onTogglePower,
  onAssembleAll,
  onDisassembleAll,
  isDataFlowActive,
  onToggleDataFlow,
  isCinematicMode,
  onToggleCinematicMode,
  isPerformanceMode,
  onTogglePerformanceMode,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'explode' | 'data' | 'fans' | 'camera' | 'parts'>('explode');

  return (
    <>
      {/* 1. TOP BAR CONTRACT */}
      <header className="absolute top-0 left-0 right-0 h-14 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-md z-30 select-none">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-cyan-500/30">
            3D
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>CYBER-PC 3D</span>
              <span className="text-xs font-normal text-cyan-400">
                الحياة الرقمية وتدفق البيانات
              </span>
            </h1>
          </div>
        </div>

        {/* Zone 1.5: Cyberpunk Device Form Factor Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/95 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/50">
          <button
            onClick={() => onSelectDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedDevice === 'desktop'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-md shadow-cyan-500/40'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
            title="كمبيوتر مكتبي متكامل (Desktop) - كرت شاشة ومبرد ومزود طاقة"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">كمبيوتر مكتبي (Desktop)</span>
            <span className="sm:hidden">مكتبي</span>
          </button>

          <button
            onClick={() => onSelectDevice('laptop')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedDevice === 'laptop'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md shadow-purple-500/40'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
            }`}
            title="لابتوب نحيف (Laptop) - شاشة OLED مفصلية، بطارية، لوحة مفاتيح"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">لابتوب (Laptop)</span>
            <span className="sm:hidden">لابتوب</span>
          </button>

          <button
            onClick={() => onSelectDevice('minipc')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedDevice === 'minipc'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
            }`}
            title="ميني بي سي/سيرفر مصغر (Mini-PC) - هيكل NUC مكعب 4×4"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ميني بي سي (Mini-PC)</span>
            <span className="sm:hidden">ميني</span>
          </button>
        </div>

        {/* Zone 2: Navigation & Mode Switches */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Cinematic Mode Toggle */}
          <button
            onClick={onToggleCinematicMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isCinematicMode
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/90 text-cyan-300 border-cyan-500/40 hover:bg-slate-800'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-cyan-300" />
            <span>الوضع السينمائي (Cinematic)</span>
          </button>

          {/* Data Flow Toggle */}
          <button
            onClick={onToggleDataFlow}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isDataFlowActive
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="تشغيل / إيقاف محاكاة تدفق البيانات والأوامر والطاقة"
          >
            <Activity className={`w-3.5 h-3.5 ${isDataFlowActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>تدفق البيانات</span>
          </button>

          {/* Guide Mode Toggle */}
          <button
            onClick={onToggleAssemblyGuide}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isAssemblyGuideOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-md shadow-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>دليل التركيب</span>
          </button>

          {/* Numbering Toggle */}
          <button
            onClick={onToggleNumbers}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showNumbers
                ? 'bg-purple-600/30 text-purple-200 border-purple-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>ترقيم (1-8)</span>
          </button>

          {/* Power Toggle */}
          <button
            onClick={onTogglePower}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isPoweredOn
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isPoweredOn ? 'النظام يعمل' : 'إيقاف'}</span>
          </button>
        </div>

        {/* Zone 3: Primary Utility Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Performance 60 FPS Mode Toggle */}
          <button
            onClick={onTogglePerformanceMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isPerformanceMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm shadow-emerald-500/30'
                : 'bg-slate-900/90 text-cyan-300 border-cyan-500/40 hover:bg-slate-800'
            }`}
            title="تبديل بين وضع الأداء الفائق (60 FPS خفيف وسريع) ووضع الدقة العالية"
          >
            <Zap className={`w-3.5 h-3.5 ${isPerformanceMode ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">{isPerformanceMode ? '⚡ فائق السرعة (60 FPS)' : '💎 دقة عالية'}</span>
            <span className="sm:hidden">{isPerformanceMode ? '⚡ 60 FPS' : '💎 دقة'}</span>
          </button>

          <button
            onClick={onDownloadSingleFile}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
            title="تحميل كملف HTML منفرد بدون أي أدوات بناء (Download Standalone Single-File)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تحميل كملف منفرد</span>
            <span className="sm:hidden">HTML</span>
          </button>

          <button
            onClick={onResetCamera}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="إعادة ضبط الكاميرا (Reset View)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. ERGONOMIC COLLAPSIBLE BOTTOM CONTROL DOCK */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-4xl transition-all duration-300 z-20 select-none ${
          isDockCollapsed ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Tab Toggle */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-900/95 border-t border-x border-cyan-500/30 rounded-t-lg transition-colors shadow-lg cursor-pointer"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>إظهار لوحة التحكم (Expand Dock)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>إخفاء لوحة التحكم (Hide Dock)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Container */}
        <div className="bg-slate-950/92 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 sm:p-4 text-slate-100 shadow-2xl shadow-cyan-950/40">
          {/* Top Row: Navigation Tabs & Global Mode Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            {/* Functional Segmented Navigation Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('explode')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'explode'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>التفكيك والتركيب</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'data'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>تدفق البيانات (Flow)</span>
              </button>

              <button
                onClick={() => setActiveTab('fans')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'fans'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wind className="w-3 h-3" />
                <span>المراوح</span>
              </button>

              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>الكاميرا</span>
              </button>

              <button
                onClick={() => setActiveTab('parts')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'parts'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>الأعضاء (1-9)</span>
              </button>
            </div>

            {/* Quick Action Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleCinematicMode}
                className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40"
              >
                <Film className="w-3.5 h-3.5" />
                <span>سينما</span>
              </button>

              <button
                onClick={onToggleXRay}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  isXRayMode
                    ? 'bg-purple-600/30 text-purple-300 border-purple-500 shadow-sm shadow-purple-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-purple-400/50'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>أشعة X-Ray</span>
              </button>

              <button
                onClick={onToggleTour}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  isTourActive
                    ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500 shadow-sm shadow-cyan-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-400/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isTourActive ? 'إيقاف الجولة' : 'جولة استكشافية'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Tab Specific Controls */}
          <div className="pt-3">
            {/* Tab 1: Explode Slider, Auto Toggle, Assemble & Disassemble All */}
            {activeTab === 'explode' && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full flex items-center gap-3">
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    مسافة التفكيك:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={explodeFactor}
                    onChange={(e) => onExplodeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-left tabular-nums">
                    {Math.round(explodeFactor * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onAssembleAll}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer"
                  >
                    تركيب الكل (Assemble)
                  </button>

                  <button
                    onClick={onDisassembleAll}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    تفكيك كامل (Explode)
                  </button>

                  <button
                    onClick={onToggleAutoExplode}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      isAutoExploding
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {isAutoExploding ? 'إيقاف النابض' : 'نابض تلقائي'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Data Flow Simulation & Key */}
            {activeTab === 'data' && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    <span className="text-slate-300 font-medium">أزرق سماوي: أوامر المعالج (Instructions)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <span className="text-slate-300 font-medium">أخضر: بيانات الذاكرة والتخزين (Data)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
                    <span className="text-slate-300 font-medium">برتقالي: طاقة المزود (Power)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
                    <span className="text-slate-300 font-medium">بنفسجي: حزم الإنترنت (Packets)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleDataFlow}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      isDataFlowActive
                        ? 'bg-cyan-500 text-slate-950 border-white'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isDataFlowActive ? 'محاكاة نشطة ✓' : 'تشغيل المحاكاة ▶'}
                  </button>

                  <button
                    onClick={() => onSelectComponent('internet')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>فحص الكرة الأرضية</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Fan Speed RPM Controls */}
            {activeTab === 'fans' && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-cyan-400">ديناميكا تدفق الهواء والتبريد:</span>
                  <span className="text-slate-400 mr-2">مروحة المشتت ومراوح كرت الشاشة ومزود الطاقة والهيكل</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['silent', 'balanced', 'turbo'] as FanSpeedMode[]).map((mode) => {
                    const label =
                      mode === 'silent'
                        ? 'هادئ (800 RPM)'
                        : mode === 'balanced'
                        ? 'متوازن (1500 RPM)'
                        : 'أقصى أداء (2800 RPM)';
                    return (
                      <button
                        key={mode}
                        onClick={() => onFanSpeedChange(mode)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          fanSpeedMode === mode
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Camera Presets */}
            {activeTab === 'camera' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 shrink-0">زوايا العرض:</span>
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onCameraPreset(preset.id)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {preset.labelAr}
                  </button>
                ))}
              </div>
            )}

            {/* Tab 5: Component Quick Selection with Human Analogies */}
            {activeTab === 'parts' && (
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  ...(DEVICE_CONFIGS[selectedDevice]?.assemblySequence || ASSEMBLY_SEQUENCE),
                  'internet' as ComponentId,
                ].map((id, idx) => {
                  const part = HARDWARE_COMPONENTS[id];
                  if (!part) return null;
                  return (
                    <button
                      key={part.id}
                      onClick={() =>
                        onSelectComponent(
                          selectedComponentId === part.id ? null : part.id
                        )
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap border flex items-center gap-1.5 cursor-pointer ${
                        selectedComponentId === part.id
                          ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <span>{part.humanIcon}</span>
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">
                        {idx + 1}.
                      </span>
                      <span>{part.nameAr.split(' ')[0]} {part.nameAr.split(' ')[1]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
