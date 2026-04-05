import React, { useEffect, useState } from 'react';
import useStore from '../../stores/useStore';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trash2, Code2, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format, parseISO, isValid, startOfWeek, getQuarter } from 'date-fns';

export default function DashboardPanelCard({ panel, onDelete, readOnly = false, preloadedResults = null }) {
  const { executePanelQuery, fixPanel, dateRange, grouping, setEditingPanel, isEditMode, dashboards, selectedDashboardId } = useStore();
  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  const defaultColor = currentDashboard?.default_chart_color || '#006e2e';

  const [data, setData] = useState(preloadedResults);
  const [loading, setLoading] = useState(!preloadedResults);
  const [fixing, setFixing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (panel.chart_type === 'text') {
      setLoading(false);
      return;
    }
    if (readOnly && preloadedResults) {
      setData(preloadedResults);
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
    <div className={`bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 flex flex-col h-full group transition-all relative ${panel.chart_type === 'text' ? 'p-4' : 'p-6'} ${isEditMode && panel.chart_type === 'text' ? 'drag-handle cursor-move' : ''} hover:shadow-md`}>
      <div className={panel.chart_type === 'text' ? 'absolute top-1 right-1 z-20' : `flex justify-between items-start mb-4 ${isEditMode ? 'drag-handle cursor-move' : ''}`}>
        {!isTitleCard && (
          <div>
            <h3 className="text-on-surface text-sm font-bold">{panel.title}</h3>
            {panel.chart_type !== 'text' && (
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest truncate max-w-sm" title={panel.natural_language_query}>
                {panel.natural_language_query}
              </p>
            )}
          </div>
        )}
        {!readOnly && (
          <div
            className={`flex items-center gap-1 transition-opacity ${isEditMode ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hover:opacity-100'}`}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button onClick={fetchData} title="Refresh" className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"><RefreshCw className="w-4 h-4" /></button>
            {isEditMode && (
              <>
                <button onClick={() => setEditingPanel(panel)} title="Edit Configuration" className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"><Code2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(panel.id)} title="Delete Chart" className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        )}
        
        {error && !loading && (
          <div className="h-full flex flex-col items-center justify-center p-4 gap-4 text-center">
            <p className="text-sm text-error font-bold">{error}</p>
            {!readOnly && (
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
            )}
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
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">No data returned</p>
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
  const numericKeys = ObjectKeys.filter(k => typeof sample[k] === 'number');
  if (numericKeys.length !== 1) return originalData;
  const numKey = numericKeys[0];
  let xAxisKey = chartConfig?.xaxis_column;
  if (!xAxisKey || !ObjectKeys.includes(xAxisKey)) {
    xAxisKey = ObjectKeys.find(k => typeof sample[k] === 'string') || ObjectKeys[0];
  }
  const categoryKeys = ObjectKeys.filter(k => k !== xAxisKey && k !== numKey && typeof sample[k] === 'string');
  if (categoryKeys.length === 0) return originalData;
  const catKey = categoryKeys[0];
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
  let date;
  if (typeof value === 'string') {
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
    case 'day': return format(date, 'MMM d, yyyy');
    case 'week': return `Week of ${format(startOfWeek(date), 'MMM d, yyyy')}`;
    case 'month': return format(date, 'MMMM yyyy');
    case 'quarter': return `Q${getQuarter(date)} ${format(date, 'yyyy')}`;
    case 'year': return format(date, 'yyyy');
    default: return value;
  }
};

function BarChartRenderer({ data, defaultColor, stacked }) {
  const { grouping } = useStore();
  const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');
  const xAxisKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  const COLORS = ['#006e2e', '#5f5e61', '#9e3f4e', '#5e5e67', '#004a1c', '#3f3f42', '#782232', '#45454e'];
  if (!keys.length) return <div className="p-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Insufficient Data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebeeef" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 9, fill: '#5a6061', fontWeight: 700 }}
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <YAxis tick={{ fontSize: 9, fill: '#5a6061', fontWeight: 700 }} tickLine={false} axisLine={false} />
        <Tooltip 
          cursor={{ fill: '#ebeeef' }}
          contentStyle={{ borderRadius: '8px', border: '1px solid #adb3b4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700 }}
          labelFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }} iconType="circle" />
        {keys.map((key, i) => (
          <Bar 
            key={key} 
            dataKey={key} 
            stackId={stacked ? "a" : undefined}
            fill={keys.length === 1 ? defaultColor : COLORS[i % COLORS.length]}
            radius={stacked ? (i === keys.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]) : [2, 2, 0, 0]}
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
  const COLORS = ['#006e2e', '#5f5e61', '#9e3f4e', '#5e5e67', '#004a1c', '#3f3f42', '#782232', '#45454e'];
  if (!keys.length) return <div className="p-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Insufficient Data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebeeef" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 9, fill: '#5a6061', fontWeight: 700 }}
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <YAxis tick={{ fontSize: 9, fill: '#5a6061', fontWeight: 700 }} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #adb3b4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700 }}
          labelFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }} iconType="circle" />
        {keys.map((key, i) => (
          <Line 
            key={key} 
            type="monotone" 
            dataKey={key} 
            stroke={keys.length === 1 ? defaultColor : COLORS[i % COLORS.length]}
            strokeWidth={2} 
            dot={{ r: 3, strokeWidth: 2, fill: keys.length === 1 ? defaultColor : COLORS[i % COLORS.length] }}
            activeDot={{ r: 5 }}
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
    const xAxisKey = Object.keys(data[0]).find(k => typeof data[0][k] === 'string');
    return Object.keys(data[0]).map(key => ({
      header: key,
      accessorKey: key,
      cell: (info) => {
        const val = info.getValue();
        if (key === xAxisKey) return formatDateByGrouping(val, grouping);
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
        <thead className="bg-surface-container-low sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10 whitespace-nowrap">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-[13px] font-medium text-on-surface whitespace-nowrap">
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
  const COLORS = ['#006e2e', '#5f5e61', '#9e3f4e', '#5e5e67', '#004a1c', '#3f3f42', '#782232', '#45454e'];
  if (!keys.length) return <div className="p-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Insufficient Data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebeeef" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 9, fill: '#5a6061', fontWeight: 700 }}
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <YAxis tick={{ fontSize: 9, fill: '#5a6061', fontWeight: 700 }} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #adb3b4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700 }}
          labelFormatter={(val) => formatDateByGrouping(val, grouping)}
        />
        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }} iconType="circle" />
        {keys.map((key, i) => (
          <Area 
            key={key} 
            type="monotone" 
            dataKey={key} 
            stackId={stacked ? "a" : undefined}
            fillOpacity={0.1}
            fill={keys.length === 1 ? defaultColor : COLORS[i % COLORS.length]}
            stroke={keys.length === 1 ? defaultColor : COLORS[i % COLORS.length]}
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
  if (!valueKey) return <div className="p-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Insufficient Data</div>;
  const COLORS = ['#006e2e', '#5f5e61', '#9e3f4e', '#5e5e67', '#004a1c', '#3f3f42', '#782232', '#45454e'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #adb3b4', fontSize: '10px', fontWeight: 700 }} />
        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

function TextRenderer({ content, config }) {
  const isTitle = config?.text_type === 'title';
  return (
    <div className={`h-full w-full flex ${isTitle ? 'items-start' : 'items-center'} justify-start`}>
      <div className={`w-full prose max-w-none ${isTitle ? 'text-[2.5rem] font-bold tracking-tighter text-on-surface leading-none' : 'text-[13px] text-on-surface-variant font-medium leading-relaxed'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
