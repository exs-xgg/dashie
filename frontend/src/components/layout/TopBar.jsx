import { Calendar, Edit2 } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function TopBar() {
  const { dateRange, setDateRange, dashboards, selectedDashboardId, setAddChartModalOpen } = useStore();
  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);

  return (
    <header className="w-full sticky top-0 z-40 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center px-8 h-12 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-on-surface-variant group cursor-pointer">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {currentDashboard?.name || "Project Sales Dashboard"}
          </span>
          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Date Filter */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg gap-2 shadow-sm shadow-zinc-200/50">
          <label htmlFor="start-date-filter" className="sr-only">Start Date</label>
          <Calendar className="w-4 h-4 text-zinc-500" />
          <input 
            id="start-date-filter"
            type="date"
            name="startDate"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
          />
          <span className="text-zinc-400 font-medium">—</span>
          <label htmlFor="end-date-filter" className="sr-only">End Date</label>
          <input 
            id="end-date-filter"
            type="date"
            name="endDate"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <span className="material-symbols-outlined text-sm">sync</span>
            Sync Schema
          </button>
          <button 
            onClick={() => setAddChartModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded hover:bg-zinc-800 transition-all active:scale-95 shadow-md shadow-zinc-950/10"
          >
            Add Chart
          </button>
        </div>
      </div>
    </header>
  );
}
