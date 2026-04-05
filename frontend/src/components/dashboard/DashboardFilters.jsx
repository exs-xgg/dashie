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
    <div className="flex items-center justify-center gap-6 mb-12">
      {/* Date Filter */}
      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/15 px-6 py-2 rounded-full gap-4 shadow-sm hover:shadow-md transition-all">
        <Calendar className="w-4 h-4 text-secondary" />
        <div className="flex items-center gap-2">
          <label htmlFor="start-date-filter" className="sr-only">Start Date</label>
          <input
            id="start-date-filter"
            type="date"
            name="startDate"
            value={localRange.start}
            onChange={(e) => setLocalRange({ ...localRange, start: e.target.value })}
            onBlur={syncDateStore}
            onKeyDown={(e) => e.key === 'Enter' && syncDateStore()}
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer"
          />
          <span className="text-outline-variant font-bold">—</span>
          <label htmlFor="end-date-filter" className="sr-only">End Date</label>
          <input
            id="end-date-filter"
            type="date"
            name="endDate"
            value={localRange.end}
            onChange={(e) => setLocalRange({ ...localRange, end: e.target.value })}
            onBlur={syncDateStore}
            onKeyDown={(e) => e.key === 'Enter' && syncDateStore()}
            className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Grouping Selector */}
      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/15 px-6 py-2 rounded-full gap-4 shadow-sm hover:shadow-md transition-all">
        <Layers className="w-4 h-4 text-secondary" />
        <select
          value={grouping}
          onChange={(e) => setGrouping(e.target.value)}
          className="bg-transparent text-sm font-bold text-on-surface outline-none cursor-pointer uppercase tracking-widest"
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
