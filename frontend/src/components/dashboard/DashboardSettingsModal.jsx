import React, { useState, useEffect } from 'react';
import { X, Settings, Layout, Save, Trash2, AlertTriangle, Globe, Copy, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../stores/useStore';

export default function DashboardSettingsModal() {
  const { 
    isDashboardSettingsModalOpen, 
    setDashboardSettingsModalOpen, 
    dashboards, 
    selectedDashboardId, 
    updateDashboard,
    deleteDashboard,
    snapshots,
    fetchSnapshots,
    deleteSnapshot
  } = useStore();

  const navigate = useNavigate();

  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingSnapshot, setDeletingSnapshot] = useState(false);

  useEffect(() => {
    if (currentDashboard && isDashboardSettingsModalOpen) {
      setFormData({
        name: currentDashboard.name || '',
        description: currentDashboard.description || ''
      });
      fetchSnapshots(selectedDashboardId);
    }
  }, [currentDashboard, isDashboardSettingsModalOpen]);

  const copyToClipboard = (id) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${id}" width="100%" height="600px" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const handleDelete = async () => {
    try {
      await deleteDashboard(selectedDashboardId);
      setDashboardSettingsModalOpen(false);
      navigate('/');
    } catch (err) {
      console.error("Failed to delete dashboard:", err);
    }
  };

  const handleDeleteSnapshot = async () => {
    if (!snapshotToDelete) return;
    setDeletingSnapshot(true);
    try {
      await deleteSnapshot(snapshotToDelete);
      setSnapshotToDelete(null);
    } catch (err) {
      console.error("Failed to delete snapshot:", err);
    } finally {
      setDeletingSnapshot(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] relative">
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

          {/* Snapshots Section */}
          <div className="space-y-4 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Published Snapshots</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                <p className="text-sm text-zinc-500">No snapshots published yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{snapshot.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">Created {new Date(snapshot.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(`/embed/${snapshot.id}`, '_blank')}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        title="View Snapshot"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(snapshot.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                      >
                        {copiedId === snapshot.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Embed</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSnapshotToDelete(snapshot.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        title="Delete Snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger Zone Section */}
          <div className="space-y-4 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-error mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Danger Zone</span>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-error/20 bg-error/5 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-error mb-1">Delete Dashboard</h4>
                <p className="text-xs text-error/80">Permanently remove this dashboard and all its widgets.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-error text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-error/20"
              >
                Delete Dashboard
              </button>
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

        {/* Snapshot Delete Confirmation Overlay */}
        {snapshotToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm rounded-2xl">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800 text-center flex flex-col">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Delete Snapshot?</h3>
              <p className="text-zinc-500 text-sm mb-8 font-medium">This snapshot and its embed link will be permanently disabled. Existing iFrames will stop working.</p>
              <div className="flex gap-3 mt-auto">
                <button 
                  type="button"
                  onClick={() => setSnapshotToDelete(null)}
                  disabled={deletingSnapshot}
                  className="flex-1 py-3 font-bold text-zinc-500 hover:text-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleDeleteSnapshot}
                  disabled={deletingSnapshot}
                  className="flex-1 bg-error text-white py-3 rounded-xl font-bold shadow-lg shadow-error/20 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingSnapshot ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm rounded-2xl">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800 text-center flex flex-col">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Dashboard?</h3>
              <p className="text-zinc-500 text-sm mb-8">This action cannot be undone. All panels and configurations will be permanently removed.</p>
              <div className="flex gap-3 mt-auto">
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 font-bold text-zinc-500 hover:text-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-error text-white py-3 rounded-xl font-bold shadow-lg shadow-error/20 hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
