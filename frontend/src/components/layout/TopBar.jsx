import { Calendar, History, Bell, Edit2 } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function TopBar() {
  const { dateRange, dashboards, selectedDashboardId } = useStore();
  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);

  return (
    <header className="w-full sticky top-0 z-40 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center px-8 h-16 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">Architect AI</h1>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
        <div className="flex items-center gap-2 text-on-surface-variant group cursor-pointer">
          <span className="text-sm font-semibold tracking-tight">
            {currentDashboard?.name || "Project Sales Dashboard"}
          </span>
          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Date Filter Pill */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg gap-3 shadow-sm shadow-zinc-200/50">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
             {dateRange.start} — {dateRange.end}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <span className="material-symbols-outlined text-lg">sync</span>
            Sync Schema
          </button>
          <button className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded hover:bg-zinc-800 transition-all active:scale-95 shadow-md shadow-zinc-950/10">
            Add Chart
          </button>
        </div>

        <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-6">
          <button className="p-2 text-zinc-500 hover:bg-zinc-200/50 rounded-full transition-colors">
            <History className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-500 hover:bg-zinc-200/50 rounded-full transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 ml-2">
            <img 
              src="https://lh3.googleusercontent.com/a/ALm5wu0p_u_..." 
              alt="Avatar" 
              className="w-full h-full object-cover grayscale opacity-80"
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"; }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
