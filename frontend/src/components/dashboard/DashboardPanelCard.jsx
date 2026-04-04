import React, { useEffect, useState } from 'react';
import useStore from '../../stores/useStore';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trash2, Edit3, Code2, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format, parseISO, isValid, startOfWeek, getQuarter } from 'date-fns';

export default function DashboardPanelCard({ panel, onDelete }) {
  const { executePanelQuery, fixPanel, dateRange, grouping, setEditingPanel, isEditMode, dashboards, selectedDashboardId } = useStore();
  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  const defaultColor = currentDashboard?.default_chart_color || '#6366f1';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (panel.chart_type === 'text') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await executePanelQuery(panel.data_source_id, panel.generated_sql);
      if (res.status === 'success') {
        setData(res.results);
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError(err.message || 'Error fetching panel data');
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    if (!error) return;
    try {
      setFixing(true);
      await fixPanel(panel.id, error);
      // Panel data will be updated via store, which triggers re-fetch due to useEffect
    } catch (err) {
      setError("AI was unable to fix the query. Error: " + err.message);
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [panel.generated_sql, panel.data_source_id, dateRange, grouping, panel.chart_type]);

  const isTitleCard = panel.chart_type === 'text' && panel.chart_config?.text_type === 'title';

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col h-full group transition-all relative ${panel.chart_type === 'text' ? 'p-4' : 'p-6'}`}>
      <div className={`${panel.chart_type === 'text' ? 'absolute top-1 right-1 z-20' : 'flex justify-between items-start mb-4'} ${isEditMode ? 'drag-handle cursor-move' : ''}`}>
        {!isTitleCard && (
          <div>
            <h3 className="text-zinc-900 dark:text-zinc-50 text-sm font-bold">{panel.title}</h3>
            {panel.chart_type !== 'text' && (
              <p className="text-xs text-zinc-500 font-medium truncate max-w-sm" title={panel.natural_language_query}>
                {panel.natural_language_query}
              </p>
            )}
          </div>
        )}
        <div 
          className={`flex items-center gap-1 transition-opacity ${isEditMode ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hover:opacity-100'}`}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button onClick={fetchData} title="Refresh" className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors dark:hover:bg-zinc-800"><RefreshCw className="w-4 h-4" /></button>
          {isEditMode && (
            <>
              <button onClick={() => setEditingPanel(panel)} title="Edit Configuration" className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors dark:hover:bg-zinc-800"><Code2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(panel.id)} title="Delete Chart" className="p-1.5 text-zinc-400 hover:text-error hover:bg-error/5 rounded transition-colors dark:hover:bg-zinc-800"><Trash2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        )}
        
        {error && !loading && (
          <div className="h-full flex flex-col items-center justify-center p-4 gap-4 text-center">
            <p className="text-sm text-error font-medium">{error}</p>
            <button
              onClick={handleFix}
              disabled={fixing}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold rounded-lg transition-all border border-secondary/20"
            >
              {fixing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Fix with AI
                </>
              )}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="h-full w-full">
            {panel.chart_type === 'text' ? (
              <TextRenderer content={panel.content} config={panel.chart_config} />
            ) : (
              data && data.length > 0 ? (
                (() => {
                  const chartData = transformDataForChart(data, panel.chart_config, panel.chart_type);
                  return (
                    <>
                      {panel.chart_type === 'bar' && <BarChartRenderer data={chartData} defaultColor={defaultColor} />}
                      {panel.chart_type === 'stacked_bar' && <BarChartRenderer data={chartData} defaultColor={defaultColor} stacked={true} />}
                      {panel.chart_type === 'line' && <LineChartRenderer data={chartData} defaultColor={defaultColor} />}
                      {panel.chart_type === 'area' && <AreaChartRenderer data={chartData} defaultColor={defaultColor} />}
                      {panel.chart_type === 'stacked_area' && <AreaChartRenderer data={chartData} defaultColor={defaultColor} stacked={true} />}
                      {panel.chart_type === 'pie' && <PieChartRenderer data={chartData} />}
                      {panel.chart_type === 'table' && <TableRenderer data={data} />}
                    </>
                  );
                })()
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-zinc-500">No data returned</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const transformDataForChart = (originalData, chartConfig, chartType) => {
  if (!originalData || originalData.length === 0 || chartType === 'table' || chartType === 'text') {
    return originalData;
  }
  
  const sample = originalData[0];
  const ObjectKeys = Object.keys(sample);
  
  // Find numeric fields
  const numericKeys = ObjectKeys.filter(k => typeof sample[k] === 'number');
  
  // Pivot only makes sense if exactly one numeric value and one extra dimension are present
  if (numericKeys.length !== 1) return originalData;
  const numKey = numericKeys[0];
  
  // Predict X-axis key
  let xAxisKey = chartConfig?.xaxis_column;
  if (!xAxisKey || !ObjectKeys.includes(xAxisKey)) {
    xAxisKey = ObjectKeys.find(k => typeof sample[k] === 'string') || ObjectKeys[0];
  }
  
  // Find categorical field (string, exclude xAxisKey)
  const categoryKeys = ObjectKeys.filter(k => k !== xAxisKey && k !== numKey && typeof sample[k] === 'string');
  
  if (categoryKeys.length === 0) return originalData;
  
  // Take first categorical key to pivot by
  const catKey = categoryKeys[0];
  
  // Pivot the data
  const pivotedMap = new Map();
  originalData.forEach(row => {
    const xVal = row[xAxisKey];
    let catVal = row[catKey];
    if (catVal == null) catVal = 'Unknown';
    const numVal = row[numKey];
    
    const mapKey = String(xVal);
    
    if (!pivotedMap.has(mapKey)) {
      pivotedMap.set(mapKey, { [xAxisKey]: xVal });
    }
    
    const entry = pivotedMap.get(mapKey);
    entry[catVal] = (entry[catVal] || 0) + numVal;
  });
  
  return Array.from(pivotedMap.values());
};

const formatDateByGrouping = (value, grouping) => {
  if (!value) return value;
  
  // Try to parse the value
  let date;
  if (typeof value === 'string') {
    // Check if it's already a string like "2024-Q1"
    if (value.match(/^\d{4}-Q\d$/)) {
      const [year, q] = value.split('-Q');
      return `Q${q} ${year}`;
    }
    date = parseISO(value);
  } else if (value instanceof Date) {
    date = value;
  } else {
    return value;
  }

  if (!isValid(date)) return value;

  switch (grouping) {
    case 'day':
      return format(date, 'MMM d, yyyy');
    case 'week':
      const weekStart = startOfWeek(date);
      return `Week of ${format(weekStart, 'MMM d, yyyy')}`;
    case 'month':
      return format(date, 'MMMM yyyy');
    case 'quarter':
      return `Q${getQuarter(date)} ${format(date, 'yyyy')}`;
    case 'year':
      return format(date, 'yyyy');
    default:
      return value;
  }
};

function BarChartRenderer({ data, defaultColor, stacked }) {

  const { grouping } = useStore();
  const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');
  const xAxisKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  
  if (!keys.length) return <div className="p-4 text-xs text-zinc-500">Could not determine numeric colums for Bar Chart</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 10, fill: '#71717a' }} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <Tooltip 
          cursor={{ fill: '#f4f4f5' }} 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
          labelFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
        {keys.map((key, i) => (
          <Bar 
            key={key} 
            dataKey={key} 
            stackId={stacked ? "a" : undefined}
            fill={keys.length === 1 ? defaultColor : ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} 
            radius={stacked ? (i === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]) : [4, 4, 0, 0]} 
          />
        ))}

      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartRenderer({ data, defaultColor }) {

  const { grouping } = useStore();
  const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');
  const xAxisKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  
  if (!keys.length) return <div className="p-4 text-xs text-zinc-500">Could not determine numeric colums for Line Chart</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 10, fill: '#71717a' }} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
          labelFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
        {keys.map((key, i) => (
          <Line 
            key={key} 
            type="monotone" 
            dataKey={key} 
            stroke={keys.length === 1 ? defaultColor : ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} 
            strokeWidth={2} 
            dot={{ r: 4, strokeWidth: 2, fill: keys.length === 1 ? defaultColor : ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4] }} 
            activeDot={{ r: 6 }} 
          />
        ))}

      </LineChart>
    </ResponsiveContainer>
  );
}

function TableRenderer({ data }) {
  const { grouping } = useStore();
  const columns = React.useMemo(() => {
    if (!data || !data.length) return [];
    
    // Determine the x-axis column to potentially format it as a date
    const xAxisKey = Object.keys(data[0]).find(k => typeof data[0][k] === 'string');

    return Object.keys(data[0]).map(key => ({
      header: key,
      accessorKey: key,
      cell: (info) => {
        const val = info.getValue();
        if (key === xAxisKey) {
          return formatDateByGrouping(val, grouping);
        }
        return val;
      }
    }));
  }, [data, grouping]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 whitespace-nowrap">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AreaChartRenderer({ data, defaultColor, stacked }) {

  const { grouping } = useStore();
  const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');
  const xAxisKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  
  if (!keys.length) return <div className="p-4 text-xs text-zinc-500">Could not determine numeric columns for Area Chart</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 10, fill: '#71717a' }} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
          labelFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
        {keys.map((key, i) => (
          <Area 
            key={key} 
            type="monotone" 
            dataKey={key} 
            stackId={stacked ? "a" : undefined}
            fillOpacity={0.3} 
            fill={keys.length === 1 ? defaultColor : ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} 
            stroke={keys.length === 1 ? defaultColor : ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} 
            strokeWidth={2} 
          />
        ))}

      </AreaChart>
    </ResponsiveContainer>
  );
}

function PieChartRenderer({ data }) {
  const nameKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  const valueKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'number');

  if (!valueKey) return <div className="p-4 text-xs text-zinc-500">Could not determine numeric columns for Pie Chart</div>;

  const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
          itemStyle={{ color: '#18181b', fontSize: '12px', fontWeight: '500' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function TextRenderer({ content, config }) {
  const isTitle = config?.text_type === 'title';
  return (
    <div className={`h-full w-full flex ${isTitle ? 'items-start' : 'items-center'} justify-start`}>
      <div className={`w-full prose dark:prose-invert max-w-none ${isTitle ? 'text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50' : 'text-sm text-zinc-500 dark:text-zinc-400 font-medium'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
