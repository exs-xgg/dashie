import React from 'react';
import { Calendar, Layers } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function DashboardFilters() {
  const { dateRange, setDateRange, grouping, setGrouping } = useStore();
  const [localRange, setLocalRange] = React.useState(dateRange);

  React.useEffect(() => {
    setLocalRange(dateRange);
  }, [dateRange]);

  const syncDateStore = () => {
    if (localRange.start !== dateRange.start || localRange.end !== dateRange.end) {
      setDateRange(localRange);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Date Filter */}
      <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg gap-2 shadow-sm shadow-zinc-200/50">
        <label htmlFor="start-date-filter" className="sr-only">Start Date</label>
        <Calendar className="w-4 h-4 text-zinc-500" />
        <input
          id="start-date-filter"
          type="date"
          name="startDate"
          value={localRange.start}
          onChange={(e) => setLocalRange({ ...localRange, start: e.target.value })}
          onBlur={syncDateStore}
          onKeyDown={(e) => e.key === 'Enter' && syncDateStore()}
          className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
        />
        <span className="text-zinc-400 font-medium">—</span>
        <label htmlFor="end-date-filter" className="sr-only">End Date</label>
        <input
          id="end-date-filter"
          type="date"
          name="endDate"
          value={localRange.end}
          onChange={(e) => setLocalRange({ ...localRange, end: e.target.value })}
          onBlur={syncDateStore}
          onKeyDown={(e) => e.key === 'Enter' && syncDateStore()}
          className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
        />
      </div>

      {/* Grouping Selector */}
      <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg gap-2 shadow-sm shadow-zinc-200/50">
        <Layers className="w-4 h-4 text-zinc-500" />
        <select
          value={grouping}
          onChange={(e) => setGrouping(e.target.value)}
          className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="quarter">Quarterly</option>
          <option value="year">Yearly</option>
        </select>
      </div>
    </div>
  );
}
