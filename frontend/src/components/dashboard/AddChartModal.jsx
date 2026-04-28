import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, ChevronRight, Database, Loader2, Code, Plus } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function AddChartModal() {
  const { isAddChartModalOpen, setAddChartModalOpen, datasources, generateQuery, selectedDashboardId, fetchPanels, createPanel, fetchQuerySuggestions } = useStore();
  const [prompt, setPrompt] = useState("");
  const [selectedDb, setSelectedDb] = useState("");
  const [preferredChartType, setPreferredChartType] = useState("auto");
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [error, setError] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  useEffect(() => {
    if (selectedDb) {
      setSuggestions([]);
      setIsSuggestionsLoading(true);
      fetchQuerySuggestions(selectedDb).then((fetchedSuggestions) => {
        setSuggestions(fetchedSuggestions);
      }).finally(() => {
        setIsSuggestionsLoading(false);
      });
    } else {
      setSuggestions([]);
    }
  }, [selectedDb]);

  if (!isAddChartModalOpen) return null;

  const handleClose = () => {
    setPrompt("");
    setSelectedDb("");
    setPreferredChartType("auto");
    setGeneratedConfig(null);
    setError(null);
    setSuggestions([]);
    setAddChartModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || !selectedDb) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const config = await generateQuery(
        selectedDb,
        prompt,
        preferredChartType,
        generatedConfig ? generatedConfig.sql : null
      );
      setGeneratedConfig(config);
      setPrompt("");
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
        layout: { w: 6, h: 4, x: 0, y: Infinity },
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/10 backdrop-blur-md"
      onClick={handleClose}
    >
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-3xl border border-outline-variant/15 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold text-on-surface">Create New Chart</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
          {!isLoading && (
            <>
              {/* Database & Chart Preference Selection */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="datasource-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4 text-secondary" />
                    Select Database
                  </label>
                  <select
                    id="datasource-select"
                    name="datasource"
                    value={selectedDb}
                    onChange={(e) => setSelectedDb(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-sm font-bold text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                  >
                    <option value="" disabled>Choose a connected database...</option>
                    {datasources.map(db => (
                      <option key={db.id} value={db.id}>{db.name} ({db.type})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="chart-type-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-secondary" />
                    Preferred Type
                  </label>
                  <select
                    id="chart-type-select"
                    name="chart_type"
                    value={preferredChartType}
                    onChange={(e) => setPreferredChartType(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-sm font-bold text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                  >
                    <option value="auto">Auto (Let AI decide)</option>
                    <option value="bar">Bar Chart</option>
                    <option value="stacked_bar">Stacked Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="stacked_area">Stacked Area Chart</option>
                    <option value="table">Table / Text Data</option>
                  </select>
                </div>
              </div>

              {/* Natural Language Input */}
              <div className="flex flex-col gap-2">
                 <label htmlFor="nl-query-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    {generatedConfig ? "Refine your chart" : "What would you like to visualize?"}
                 </label>
                 <div className="relative group mt-1">
                    <input
                      id="nl-query-input"
                      name="nl-query"
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={generatedConfig ? "e.g., Change it to a line chart, or filter by region..." : "e.g., Show me top 10 products by revenue this month."}
                      className="w-full h-16 px-6 pr-24 bg-surface-container-low border-none rounded-2xl text-lg font-bold text-on-surface placeholder:text-outline-variant/50 focus:ring-2 focus:ring-secondary/20 transition-all outline-none shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button 
                        disabled={!prompt.trim() || !selectedDb}
                        onClick={handleSubmit}
                        className="p-2.5 bg-secondary text-on-secondary rounded-xl hover:bg-secondary-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-secondary/20"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                     </div>
                  </div>
                  
                  {/* AI Suggestions */}
                  {!generatedConfig && selectedDb && (isSuggestionsLoading || suggestions.length > 0) && (
                    <div className="flex flex-wrap items-stretch gap-3 mt-4 animate-in fade-in duration-300">
                      {isSuggestionsLoading ? (
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-bold px-2 py-1 uppercase tracking-widest">
                          <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                          Generating suggestions...
                        </div>
                      ) : (
                        suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPrompt(suggestion)}
                            className="text-[11px] p-4 bg-surface-container-lowest border border-outline-variant/15 hover:border-secondary/30 hover:shadow-md text-on-surface font-bold rounded-xl transition-all text-left flex-1 min-w-[200px] shadow-sm leading-relaxed uppercase tracking-wider"
                          >
                            {suggestion}
                          </button>
                        ))
                      )}
                    </div>
                  )}
               </div>

              {error && (
                <div className="p-4 bg-error/10 text-error rounded-xl text-xs font-bold border border-error/20">
                  {error}
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-secondary animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">AI is thinking...</h3>
                <p className="text-[10px] text-on-surface-variant mt-2 font-bold uppercase tracking-tighter">Generating and verifying SQL against the database.</p>
              </div>
            </div>
          )}

          {generatedConfig && !isLoading && (
            <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
              <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-xl relative">
                 <div className="absolute -top-3 left-4 bg-secondary text-on-secondary px-3 py-0.5 text-[10px] font-bold flex items-center gap-1.5 border-none rounded-full shadow-lg shadow-secondary/10 uppercase tracking-widest">
                    <Code className="w-3 h-3" /> SQL VERIFIED
                 </div>
                 
                 <div className="flex flex-col gap-5 mt-4">
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Title</label>
                      <input
                        type="text"
                        value={generatedConfig.title}
                        onChange={(e) => setGeneratedConfig({...generatedConfig, title: e.target.value})}
                        className="w-full bg-surface-container-lowest border-none rounded-lg px-3 py-2 text-on-surface font-bold text-lg focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Chart Type</label>
                        <select
                          value={generatedConfig.chart_type}
                          onChange={(e) => setGeneratedConfig({...generatedConfig, chart_type: e.target.value})}
                          className="w-full bg-surface-container-lowest border-none rounded-lg px-3 py-2 text-on-surface text-xs font-bold uppercase tracking-tighter focus:ring-2 focus:ring-secondary/20 outline-none"
                        >
                          <option value="bar">Bar</option>
                          <option value="stacked_bar">Stacked Bar</option>
                          <option value="line">Line</option>
                          <option value="pie">Pie</option>
                          <option value="area">Area</option>
                          <option value="stacked_area">Stacked Area</option>
                          <option value="table">Table</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">X-Axis</label>
                        <input
                          type="text"
                          value={generatedConfig.xaxis_column}
                          onChange={(e) => setGeneratedConfig({...generatedConfig, xaxis_column: e.target.value})}
                          className="w-full bg-surface-container-lowest border-none rounded-lg px-3 py-2 text-on-surface text-xs font-mono font-bold focus:ring-2 focus:ring-secondary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Y-Axes (comma separated)</label>
                        <input
                          type="text"
                          value={generatedConfig.yaxis_columns?.join(', ')}
                          onChange={(e) => setGeneratedConfig({...generatedConfig, yaxis_columns: e.target.value.split(',').map(s => s.trim())})}
                          className="w-full bg-surface-container-lowest border-none rounded-lg px-3 py-2 text-on-surface text-xs font-mono font-bold focus:ring-2 focus:ring-secondary/20 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">SQL Query</label>
                      <textarea
                        value={generatedConfig.sql}
                        onChange={(e) => setGeneratedConfig({...generatedConfig, sql: e.target.value})}
                        className="mt-2 w-full h-48 p-4 bg-on-surface text-surface-container-lowest rounded-xl text-xs font-mono overflow-x-auto shadow-inner resize-none outline-none focus:ring-2 focus:ring-secondary/50"
                        spellCheck="false"
                      />
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                <button 
                  onClick={() => {
                    setGeneratedConfig(null);
                    setPrompt("");
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest"
                >
                  Clear
                </button>
                <button 
                  onClick={handleAddToDashboard}
                  className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20 active:scale-95 uppercase tracking-widest"
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
