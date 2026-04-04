import React, { useState } from 'react';
import { Plus, Type, BarChart2, ChevronRight, X, Layout, Palette } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function FloatingToolbar() {
  const { setAddChartModalOpen, addTextPanel, selectedDashboardId, dashboards, updateDashboard, isEditMode } = useStore();

  if (!isEditMode) return null;

  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  const defaultColor = currentDashboard?.default_chart_color || '#6366f1';

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
    <div className="flex flex-col items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl shadow-lg shadow-zinc-200/20 dark:shadow-zinc-950/40">
      <div className="flex flex-col items-center border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-1 gap-1">
        <button
          onClick={() => setAddChartModalOpen(true)}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all group relative rainbow-border"
          title="Add Chart with AI"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Add Chart with AI
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-1">
        <button
          onClick={() => handleAddText('title')}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all group relative"
          title="Add Title"
        >
          <Type className="w-5 h-5" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Add Title
          </span>
        </button>

        <button
          onClick={() => handleAddText('caption')}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all group relative"
          title="Add Caption"
        >
          <Layout className="w-5 h-5" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Add Caption
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="relative group p-2 text-zinc-600 dark:text-zinc-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all cursor-pointer">
          <Palette className="w-5 h-5" />
          <input
            type="color"
            value={defaultColor}
            onChange={handleColorChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Chart Default Color"
          />
          <div 
             className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-zinc-900 shadow-sm"
             style={{ backgroundColor: defaultColor }}
          />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Default Chart Color
          </span>
        </div>
      </div>
    </div>
  );
}

