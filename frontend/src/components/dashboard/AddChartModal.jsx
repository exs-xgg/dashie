import React, { useState } from 'react';
import { X, Search, Sparkles, ChevronRight, Database } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function AddChartModal() {
  const { isAddChartModalOpen, setAddChartModalOpen, datasources } = useStore();
  const [prompt, setPrompt] = useState("");
  const [selectedDb, setSelectedDb] = useState("");

  if (!isAddChartModalOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && prompt.trim() && selectedDb) {
      alert(`Generating query for: ${prompt} on database ${selectedDb}`);
      setPrompt("");
      setAddChartModalOpen(false);
    }
  };

  const handleSubmit = () => {
    if (prompt.trim() && selectedDb) {
      alert(`Generating query for: ${prompt} on database ${selectedDb}`);
      setPrompt("");
      setAddChartModalOpen(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
      onClick={() => setAddChartModalOpen(false)}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Create New Chart</h2>
          <button 
            onClick={() => setAddChartModalOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col gap-8">
          {/* Database Selection */}
          <div className="flex flex-col gap-2">
            <label htmlFor="datasource-select" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-secondary" />
              Select Database
            </label>
            <select
              id="datasource-select"
              name="datasource"
              value={selectedDb}
              onChange={(e) => setSelectedDb(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
            >
              <option value="" disabled>Choose a connected database...</option>
              {datasources.map(db => (
                <option key={db.id} value={db.id}>{db.name} ({db.type})</option>
              ))}
            </select>
          </div>

          {/* Natural Language Input */}
          <div className="flex flex-col gap-2">
             <label htmlFor="nl-query-input" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                What would you like to visualize?
             </label>
             <div className="relative group mt-1">
                <input
                  id="nl-query-input"
                  name="nl-query"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Show me top 10 products by revenue this month."
                  className="w-full h-16 px-6 pr-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-base font-medium placeholder:text-zinc-400 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    disabled={!prompt.trim() || !selectedDb}
                    onClick={handleSubmit}
                    className="p-2.5 bg-secondary text-white rounded-xl hover:bg-secondary-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-secondary/20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
