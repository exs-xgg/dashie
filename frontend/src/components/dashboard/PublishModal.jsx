import React, { useState } from 'react';
import { X, Camera, Copy, Check, Globe, Lock, Unlock } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function PublishModal() {
  const {
    isPublishModalOpen,
    setPublishModalOpen,
    selectedDashboardId,
    createSnapshot,
    dateRange,
    grouping
  } = useStore();

  const [name, setName] = useState(`Snapshot ${new Date().toLocaleString()}`);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSnapshot, setPublishedSnapshot] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lockFilters, setLockFilters] = useState(true);

  if (!isPublishModalOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const snapshot = await createSnapshot({
        dashboard_id: selectedDashboardId,
        name,
        filter_settings: {
          date_range: lockFilters ? dateRange : null,
          grouping: lockFilters ? grouping : 'day',
          locked: lockFilters
        }
      });
      setPublishedSnapshot(snapshot);
    } catch (err) {
      console.error("Failed to publish snapshot:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = publishedSnapshot
    ? `<iframe src="${window.location.origin}/embed/${publishedSnapshot.id}" width="100%" height="600px" frameborder="0"></iframe>`
    : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Publish Snapshot</h2>
              <p className="text-xs text-zinc-500 font-medium">Create a public version of your dashboard</p>
            </div>
          </div>
          <button
            onClick={() => {
              setPublishModalOpen(false);
              setPublishedSnapshot(null);
            }}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!publishedSnapshot ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Snapshot Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                lockFilters
                  ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800/50'
                  : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700'
              }`}
              onClick={() => setLockFilters(!lockFilters)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${lockFilters ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-200 text-zinc-500'}`}>
                  {lockFilters ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Lock Filters</h4>
                  <p className="text-xs text-zinc-500">Capture data with current date range and grouping</p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${lockFilters ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${lockFilters ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <Camera className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Current Settings</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Date Range</p>
                  <p className="text-xs font-medium dark:text-zinc-300">{dateRange.start} to {dateRange.end}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Grouping</p>
                  <p className="text-xs font-medium capitalize dark:text-zinc-300">{grouping}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Publish Snapshot
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Successfully Published!</h3>
              <p className="text-sm text-zinc-500 mt-1">Your snapshot is now live and ready to be embedded.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Iframe Embed Code</label>
              <div className="relative group">
                <textarea
                  readOnly
                  value={embedCode}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-400 resize-none h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(embedCode)}
                  className="absolute top-2 right-2 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all text-zinc-500"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.open(`/embed/${publishedSnapshot.id}`, '_blank')}
                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                View Live
              </button>
              <button
                onClick={() => {
                  setPublishModalOpen(false);
                  setPublishedSnapshot(null);
                }}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
