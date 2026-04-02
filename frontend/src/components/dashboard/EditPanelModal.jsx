import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Code, BarChart2 } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function EditPanelModal({ panel, isOpen, onClose }) {
  const { updatePanel } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    generated_sql: '',
    chart_type: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (panel) {
      setFormData({
        title: panel.title || '',
        generated_sql: panel.generated_sql || '',
        chart_type: panel.chart_type || ''
      });
    }
  }, [panel, isOpen]);

  if (!isOpen || !panel) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await updatePanel(panel.dashboard_id, panel.id, formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to update chart");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-start justify-center pt-20 p-4 bg-zinc-950/20 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
               <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Chart Configuration</h2>
              <p className="text-xs text-zinc-500 font-medium">Modify query, title or visualization type</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Chart Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            />
          </div>

          {/* Chart Type Selection */}
          <div className="flex flex-col gap-2">
             <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
               <BarChart2 className="w-4 h-4 text-secondary" />
               Visualization Type
             </label>
             <select
               value={formData.chart_type}
               onChange={(e) => setFormData({ ...formData, chart_type: e.target.value })}
               className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
             >
               <option value="bar">Bar Chart</option>
               <option value="line">Line Chart</option>
               <option value="area">Area Chart</option>
               <option value="pie">Pie Chart</option>
               <option value="table">Table / Text Data</option>
             </select>
          </div>

          {/* SQL Editor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">SQL Query</label>
            <div className="relative">
              <textarea
                value={formData.generated_sql}
                onChange={(e) => setFormData({ ...formData, generated_sql: e.target.value })}
                className="w-full h-48 bg-zinc-900 text-zinc-100 font-mono text-xs p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-secondary/50"
                spellCheck="false"
              />
              <div className="absolute top-3 right-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none">
                SQL EDITOR
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic">
              Use <code className="text-secondary font-bold">{"{{date_filter:table.column}}"}</code> to automatically apply global date range filters.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium flex items-center gap-2 border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-zinc-900/10 dark:shadow-white/5"
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
