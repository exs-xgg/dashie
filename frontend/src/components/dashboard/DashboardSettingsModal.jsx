import React, { useState, useEffect } from 'react';
import { X, Settings, Layout, Save } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function DashboardSettingsModal() {
  const { 
    isDashboardSettingsModalOpen, 
    setDashboardSettingsModalOpen, 
    dashboards, 
    selectedDashboardId, 
    updateDashboard 
  } = useStore();

  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentDashboard && isDashboardSettingsModalOpen) {
      setFormData({
        name: currentDashboard.name || '',
        description: currentDashboard.description || ''
      });
    }
  }, [currentDashboard, isDashboardSettingsModalOpen]);

  if (!isDashboardSettingsModalOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDashboard(selectedDashboardId, formData);
      setDashboardSettingsModalOpen(false);
    } catch (err) {
      console.error("Failed to update dashboard settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Dashboard Settings</h2>
              <p className="text-xs text-zinc-500 font-medium">Customize your dashboard appearance and metadata</p>
            </div>
          </div>
          <button 
            onClick={() => setDashboardSettingsModalOpen(false)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* General Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Layout className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">General Information</span>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dashboard-name" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Dashboard Name
              </label>
              <input
                id="dashboard-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sales Overview"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-500 outline-none transition-all text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dashboard-description" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <textarea
                id="dashboard-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe what this dashboard shows..."
                rows={2}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-500 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

        </form>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDashboardSettingsModalOpen(false)}
            className="px-6 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-zinc-950/10"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
