import React, { useState } from 'react';
import { X, Search, Sparkles, ChevronRight, Database, Loader2, Code, Plus } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function AddChartModal() {
  const { isAddChartModalOpen, setAddChartModalOpen, datasources, generateQuery, selectedDashboardId, fetchPanels, createPanel } = useStore();
  const [prompt, setPrompt] = useState("");
  const [selectedDb, setSelectedDb] = useState("");
  const [preferredChartType, setPreferredChartType] = useState("auto");
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [error, setError] = useState(null);

  if (!isAddChartModalOpen) return null;

  const handleClose = () => {
    setPrompt("");
    setSelectedDb("");
    setPreferredChartType("auto");
    setGeneratedConfig(null);
    setError(null);
    setAddChartModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || !selectedDb) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const config = await generateQuery(selectedDb, prompt, preferredChartType);
      setGeneratedConfig(config);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "An error occurred while generating the chart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleAddToDashboard = async () => {
    try {
      if (!selectedDashboardId) {
        alert("Please select a dashboard first!");
        return;
      }

      await createPanel(selectedDashboardId, {
        title: generatedConfig.title,
        chart_type: generatedConfig.chart_type,
        sql_query: generatedConfig.sql,
        natural_language_query: prompt,
        generated_sql: generatedConfig.sql,
        data_source_id: selectedDb,
        layout: { w: 6, h: 4, x: 0, y: Infinity }, // Infinity puts it at bottom
        chart_config: {
          xaxis_column: generatedConfig.xaxis_column,
          yaxis_columns: generatedConfig.yaxis_columns
        }
      });
      fetchPanels(selectedDashboardId);
      handleClose();
    } catch (err) {
      setError("Failed to add chart to dashboard.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Create New Chart</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col gap-8 overflow-y-auto">
          {!generatedConfig && !isLoading && (
            <>
              {/* Database & Chart Preference Selection */}
              <div className="grid grid-cols-2 gap-4">
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

                <div className="flex flex-col gap-2">
                  <label htmlFor="chart-type-select" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Search className="w-4 h-4 text-secondary" />
                    Preferred Type
                  </label>
                  <select
                    id="chart-type-select"
                    name="chart_type"
                    value={preferredChartType}
                    onChange={(e) => setPreferredChartType(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                  >
                    <option value="auto">Auto (Let AI decide)</option>
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="table">Table / Text Data</option>
                  </select>
                </div>
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

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-锌-50">AI is thinking...</h3>
                <p className="text-xs text-zinc-500 mt-1">Generating and verifying SQL against the database.</p>
              </div>
            </div>
          )}

          {generatedConfig && !isLoading && (
            <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl relative">
                 <div className="absolute -top-3 left-4 bg-white dark:bg-zinc-900 px-2 text-xs font-bold text-secondary flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full">
                    <Code className="w-3 h-3" /> VERIFIED SQL GENERATED
                 </div>
                 
                 <div className="flex flex-col gap-4 mt-2">
                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</span>
                      <p className="text-zinc-900 dark:text-zinc-100 font-medium">{generatedConfig.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chart Type</span>
                        <p className="text-zinc-900 dark:text-zinc-100 text-sm font-medium capitalize">{generatedConfig.chart_type}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">X-Axis</span>
                        <p className="text-zinc-900 dark:text-zinc-100 text-sm font-medium font-mono">{generatedConfig.xaxis_column}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Y-Axis</span>
                        <p className="text-zinc-900 dark:text-zinc-100 text-sm font-medium font-mono">{generatedConfig.yaxis_columns?.join(', ')}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Generated Query</span>
                      <pre className="mt-2 p-3 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono overflow-x-auto">
                        {generatedConfig.sql}
                      </pre>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setGeneratedConfig(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Regenerate
                </button>
                <button 
                  onClick={handleAddToDashboard}
                  className="flex items-center gap-2 px-5 py-2 bg-secondary text-white text-sm font-semibold rounded-lg hover:bg-secondary-dim transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
