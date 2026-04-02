import React, { useEffect, useState } from 'react';
import useStore from '../../stores/useStore';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trash2, Edit3, Code2, Loader2, RefreshCw } from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

export default function DashboardPanelCard({ panel, onDelete }) {
  const { executePanelQuery } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
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

  useEffect(() => {
    fetchData();
  }, [panel.generated_sql, panel.data_source_id]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4 drag-handle cursor-move">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{panel.title}</h3>
          <p className="text-xs text-zinc-500 font-medium truncate max-w-sm" title={panel.natural_language_query}>
            {panel.natural_language_query}
          </p>
        </div>
        <div 
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button onClick={fetchData} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors dark:hover:bg-zinc-800"><RefreshCw className="w-4 h-4" /></button>
          <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors dark:hover:bg-zinc-800"><Code2 className="w-4 h-4" /></button>
          <button onClick={() => onDelete(panel.id)} className="p-1.5 text-zinc-400 hover:text-error hover:bg-error/5 rounded transition-colors dark:hover:bg-zinc-800"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        )}
        
        {error && !loading && (
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-sm text-error text-center">{error}</p>
          </div>
        )}

        {!loading && !error && data && data.length === 0 && (
           <div className="h-full flex items-center justify-center">
             <p className="text-sm text-zinc-500">No data returned</p>
           </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="h-full w-full">
            {panel.chart_type === 'bar' && <BarChartRenderer data={data} />}
            {panel.chart_type === 'line' && <LineChartRenderer data={data} />}
            {panel.chart_type === 'area' && <AreaChartRenderer data={data} />}
            {panel.chart_type === 'pie' && <PieChartRenderer data={data} />}
            {panel.chart_type === 'table' && <TableRenderer data={data} />}
          </div>
        )}
      </div>
    </div>
  );
}

function BarChartRenderer({ data }) {
  const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');
  const xAxisKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  
  if (!keys.length) return <div className="p-4 text-xs text-zinc-500">Could not determine numeric colums for Bar Chart</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        {keys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartRenderer({ data }) {
  const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');
  const xAxisKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  
  if (!keys.length) return <div className="p-4 text-xs text-zinc-500">Could not determine numeric colums for Line Chart</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        {keys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function TableRenderer({ data }) {
  const columns = React.useMemo(() => {
    if (!data || !data.length) return [];
    return Object.keys(data[0]).map(key => ({
      header: key,
      accessorKey: key,
    }));
  }, [data]);

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

function AreaChartRenderer({ data }) {
  const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');
  const xAxisKey = Object.keys(data[0] || {}).find(k => typeof data[0][k] === 'string') || Object.keys(data[0] || {})[0];
  
  if (!keys.length) return <div className="p-4 text-xs text-zinc-500">Could not determine numeric columns for Area Chart</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        {keys.map((key, i) => (
          <Area key={key} type="monotone" dataKey={key} fillOpacity={0.3} fill={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} stroke={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]} strokeWidth={2} />
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
