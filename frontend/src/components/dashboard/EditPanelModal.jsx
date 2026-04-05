import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Code, BarChart2, Type } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function EditPanelModal({ panel, isOpen, onClose }) {
  const { updatePanel } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    generated_sql: '',
    chart_type: '',
    content: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (panel) {
      setFormData({
        title: panel.title || '',
        generated_sql: panel.generated_sql || '',
        chart_type: panel.chart_type || '',
        content: panel.content || ''
      });
    }
  }, [panel, isOpen]);

  const insertMarkdown = (before, after) => {
    const textarea = document.getElementById('markdown-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selection = text.substring(start, end);
    const newText = text.substring(0, start) + before + selection + after + text.substring(end);

    setFormData({ ...formData, content: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };
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
      className="fixed inset-0 z-[60] flex items-start justify-center pt-20 p-4 bg-inverse-surface/10 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl border border-outline-variant/15 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
               {formData.chart_type === 'text' ? <Type className="w-5 h-5" /> : <Code className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                {formData.chart_type === 'text' ? 'Edit Text Panel' : 'Edit Chart Configuration'}
              </h2>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                {formData.chart_type === 'text' ? 'Modify the text content' : 'Modify query, title or visualization type'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Panel Title (Internal)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-2.5 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            />
          </div>

          {formData.chart_type === 'text' ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Type className="w-4 h-4 text-secondary" />
                  Markdown Content
                </label>
                {/* Markdown Toolbar */}
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-1 px-2 text-[10px] font-bold hover:bg-surface-container-lowest rounded transition-all uppercase tracking-tighter"
                    title="Bold"
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-1 px-2 text-[10px] font-bold hover:bg-surface-container-lowest rounded transition-all uppercase tracking-tighter italic"
                    title="Italic"
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('# ', '')}
                    className="p-1 px-2 text-[10px] font-bold hover:bg-surface-container-lowest rounded transition-all uppercase tracking-tighter"
                    title="Heading"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ', '')}
                    className="p-1 px-2 text-[10px] font-bold hover:bg-surface-container-lowest rounded transition-all uppercase tracking-tighter"
                    title="Bullet List"
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[', '](url)')}
                    className="p-1 px-2 text-[10px] font-bold hover:bg-surface-container-lowest rounded transition-all uppercase tracking-tighter"
                    title="Link"
                  >
                    Link
                  </button>
                </div>
              </div>
              <textarea
                id="markdown-editor"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full h-64 bg-surface-container-low border-none rounded-xl p-4 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-mono"
                placeholder="Enter markdown here..."
              />
            </div>
          ) : (
            <>
              {/* Chart Type Selection */}
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                   <BarChart2 className="w-4 h-4 text-secondary" />
                   Visualization Type
                 </label>
                 <select
                   value={formData.chart_type}
                   onChange={(e) => setFormData({ ...formData, chart_type: e.target.value })}
                   className="w-full bg-surface-container-low border-none rounded-xl px-4 py-2.5 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                 >
                   <option value="bar">Bar Chart</option>
                   <option value="stacked_bar">Stacked Bar Chart</option>
                   <option value="line">Line Chart</option>
                   <option value="area">Area Chart</option>
                   <option value="stacked_area">Stacked Area Chart</option>
                   <option value="pie">Pie Chart</option>
                   <option value="table">Table / Text Data</option>
                 </select>
              </div>

              {/* SQL Editor */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">SQL Query</label>
                <div className="relative">
                  <textarea
                    value={formData.generated_sql}
                    onChange={(e) => setFormData({ ...formData, generated_sql: e.target.value })}
                    className="w-full h-48 bg-on-surface text-surface-container-lowest font-mono text-[11px] p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-secondary/50 shadow-inner"
                    spellCheck="false"
                  />
                  <div className="absolute top-3 right-3 text-[10px] font-bold text-surface-container-highest/50 uppercase tracking-widest pointer-events-none">
                    SQL EDITOR
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">
                  Use <code className="text-secondary">{"{{date_filter:table.column}}"}</code> to automatically apply global date range filters.
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-error/10 text-error rounded-xl text-xs font-bold border border-error/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-on-surface text-surface-container-lowest text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-on-surface/10 uppercase tracking-widest"
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
