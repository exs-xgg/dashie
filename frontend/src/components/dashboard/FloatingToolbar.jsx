import React from 'react';
import { Type, BarChart2, Layout, Palette, Sparkles } from 'lucide-react';
import useStore from '../../stores/useStore';
import { DEFAULT_CHART_COLOR } from '../../constants/chartColors';

export default function FloatingToolbar() {
  const { setAddChartModalOpen, addTextPanel, selectedDashboardId, dashboards, updateDashboard, isEditMode } = useStore();

  if (!isEditMode) return null;

  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  const defaultColor = currentDashboard?.default_chart_color || DEFAULT_CHART_COLOR;

  const handleAddText = async (type) => {
    if (!selectedDashboardId) return;
    await addTextPanel(selectedDashboardId, type);
  };

  const handleColorChange = async (e) => {
    const newColor = e.target.value;
    if (!selectedDashboardId) return;
    await updateDashboard(selectedDashboardId, { default_chart_color: newColor });
  };

  return (
    <div className="flex flex-col items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/15 p-1.5 rounded-xl shadow-2xl shadow-on-surface/5">
      <div className="flex flex-col items-center border-b border-outline-variant/10 pb-2 mb-1 gap-1">
        <button
          onClick={() => setAddChartModalOpen(true)}
          className="p-2 text-on-surface-variant hover:text-secondary hover:bg-surface-container-low rounded-lg transition-all group relative neon-glow"
          title="Add Chart with AI"
        >
          <Sparkles className="w-5 h-5" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-on-surface text-surface-container-lowest text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl uppercase tracking-widest">
            Add Chart with AI
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 border-b border-outline-variant/10 pb-2 mb-1">
        <button
          onClick={() => handleAddText('title')}
          className="p-2 text-on-surface-variant hover:text-secondary hover:bg-surface-container-low rounded-lg transition-all group relative"
          title="Add Title"
        >
          <Type className="w-5 h-5" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-on-surface text-surface-container-lowest text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl uppercase tracking-widest">
            Add Title
          </span>
        </button>

        <button
          onClick={() => handleAddText('caption')}
          className="p-2 text-on-surface-variant hover:text-secondary hover:bg-surface-container-low rounded-lg transition-all group relative"
          title="Add Caption"
        >
          <Layout className="w-5 h-5" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-on-surface text-surface-container-lowest text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl uppercase tracking-widest">
            Add Caption
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="relative group p-2 text-on-surface-variant hover:text-secondary hover:bg-surface-container-low rounded-lg transition-all cursor-pointer">
          <Palette className="w-5 h-5" />
          <input
            type="color"
            value={defaultColor}
            onChange={handleColorChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Chart Default Color"
          />
          <div 
             className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-surface-container-lowest shadow-sm"
             style={{ backgroundColor: defaultColor }}
          />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-on-surface text-surface-container-lowest text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl uppercase tracking-widest">
            Default Chart Color
          </span>
        </div>
      </div>
    </div>
  );
}
