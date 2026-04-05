import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useStore from '../stores/useStore';
import { Responsive, WidthProvider } from 'react-grid-layout';
import DashboardPanelCard from '../components/dashboard/DashboardPanelCard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function EmbedPage() {
  const { id } = useParams();
  const { fetchSnapshot } = useStore();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSnapshot(id);
        setSnapshot(data);
      } catch (err) {
        setError(err.message || 'Failed to load snapshot');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 animate-spin rounded-full" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading Snapshot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 space-y-4 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Snapshot Not Found</h2>
        <p className="text-sm text-zinc-500 max-w-sm">This snapshot might have been deleted or the link is invalid.</p>
      </div>
    );
  }

  const layout = snapshot.snapshot_data.map(p => {
    let l = p.layout;
    if (typeof l === 'string') {
      try { l = JSON.parse(l); } catch (e) { l = null; }
    }
    return {
      i: p.id,
      x: l?.x || 0,
      y: l?.y || 0,
      w: l?.w || 4,
      h: l?.h || 3,
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
             </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{snapshot.name}</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Published on {new Date(snapshot.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
           {snapshot.filter_settings.locked ? (
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Period</span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {snapshot.filter_settings.date_range.start} - {snapshot.filter_settings.date_range.end}
                  </span>
                </div>
                <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Grouping</span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 capitalize">
                    {snapshot.filter_settings.grouping}
                  </span>
                </div>
             </div>
           ) : (
             <span className="text-xs font-bold text-zinc-500 italic">No Locked Filters</span>
           )}
        </div>
      </div>

      <div className="flex-1 p-6">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={false}
          isResizable={false}
        >
          {snapshot.snapshot_data.map(panel => (
            <div key={panel.id}>
              <DashboardPanelCard panel={panel} readOnly={true} preloadedResults={panel.results} />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-center bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
          Powered by <span className="text-zinc-900 dark:text-zinc-50 tracking-normal text-xs">dashie</span>
        </p>
      </div>
    </div>
  );
}
