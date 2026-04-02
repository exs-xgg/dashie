import React, { useState } from 'react';
import { Plus, Type, BarChart2, ChevronRight, X, Layout } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function FloatingToolbar() {
  const { setAddChartModalOpen, addTextPanel, selectedDashboardId, isEditMode } = useStore();

  if (!isEditMode) return null;

  const handleAddText = async (type) => {
    if (!selectedDashboardId) return;
    await addTextPanel(selectedDashboardId, type);
  };

  return (
    <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl shadow-lg shadow-zinc-200/20 dark:shadow-zinc-950/40">
      <div className="flex items-center border-r border-zinc-200 dark:border-zinc-800 pr-2 mr-1 gap-1">
        <button
          onClick={() => setAddChartModalOpen(true)}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all group relative"
          title="Add AI Chart"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Add Chart
          </span>
        </button>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAddText('title')}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all group relative"
          title="Add Title"
        >
          <Type className="w-5 h-5" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Add Title
          </span>
        </button>
        
        <button
          onClick={() => handleAddText('caption')}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all group relative"
          title="Add Caption"
        >
          <Layout className="w-5 h-5" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Add Caption
          </span>
        </button>
      </div>
    </div>
  );
}
