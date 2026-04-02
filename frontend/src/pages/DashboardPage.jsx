import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QueryInput from '../components/query/QueryInput';
import useStore from '../stores/useStore';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { BarChart, Users, ArrowUpRight, Copy, Edit3, Trash2, Code2, List, BarChart3 } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardPage() {
  const { id } = useParams();
  const { panels, fetchPanels, setSelectedDashboardId } = useStore();

  useEffect(() => {
    if (id) {
      setSelectedDashboardId(id);
      fetchPanels(id);
    }
  }, [id]);

  const layout = [
    { i: '1', x: 0, y: 0, w: 8, h: 4 },
    { i: '2', x: 8, y: 0, w: 4, h: 2 },
    { i: '3', x: 8, y: 2, w: 4, h: 2 },
    { i: '4', x: 0, y: 4, w: 12, h: 4 },
  ];

  return (
    <div className="flex flex-col gap-12">
      <QueryInput />
      
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".drag-handle"
      >
        {/* Mock Top Product Panel */}
        <div key="1" className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col group">
          <div className="flex justify-between items-start mb-8 drag-handle cursor-move">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Top 10 Products by Revenue</h3>
              <p className="text-xs text-zinc-500 font-medium">Channel: Direct Sales • Monthly</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors dark:hover:bg-zinc-800"><Code2 className="w-4 h-4" /></button>
              <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded transition-colors dark:hover:bg-zinc-800"><Edit3 className="w-4 h-4" /></button>
              <button className="p-1.5 text-zinc-400 hover:text-error hover:bg-error/5 rounded transition-colors dark:hover:bg-zinc-800"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-3 px-4">
             {/* Simulated Chart Bars */}
             {[90, 75, 82, 100, 60, 45, 90, 35, 55, 70].map((h, i) => (
               <div key={i} className="flex-1 rounded-t-sm bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer group/bar relative" style={{ height: `${h}%` }}>
                 <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">$42,900</div>
               </div>
             ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
            <div className="flex gap-4">
              <button className="text-xs font-bold text-secondary bg-secondary/5 px-2.5 py-1 rounded-full uppercase tracking-tighter">Chart View</button>
              <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-tighter transition-colors">Table View</button>
            </div>
          </div>
        </div>

        {/* Mock Conversion Target Card */}
        <div key="2" className="bg-secondary text-white p-8 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-lg shadow-secondary/20">
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Monthly Target</span>
            <div className="text-4xl font-bold mt-2">$842k</div>
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium animate-pulse">+12.4% from last month</span>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Mock Query Stats Card */}
        <div key="3" className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-xl flex flex-col justify-between border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start">
             <div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Queries</span>
               <div className="text-3xl font-bold mt-2 text-zinc-900 dark:text-zinc-50">1,204</div>
             </div>
             <BarChart3 className="w-6 h-6 text-secondary" />
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-secondary w-3/4 rounded-full"></div>
          </div>
        </div>

        {/* Mock Transaction Table Wide */}
        <div key="4" className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
           <div className="p-6 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Recent Transactions</h3>
              <div className="flex gap-2">
                <button className="text-xs font-bold text-secondary px-3 py-1 bg-secondary/5 rounded-full hover:bg-secondary/10 transition-colors">Export CSV</button>
              </div>
           </div>
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-zinc-100/50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[
                    { id: '#TXN-8902', name: 'Alex Rivera', status: 'Completed', amount: '$1,240' },
                    { id: '#TXN-8901', name: 'Sarah Chen', status: 'Pending', amount: '$890' },
                    { id: '#TXN-8899', name: 'Marcus Holloway', status: 'Completed', amount: '$2,100' },
                  ].map((t, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 text-xs font-mono text-zinc-500">{t.id}</td>
                      <td className="px-6 py-4 text-sm font-medium">{t.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.status === 'Completed' ? 'bg-secondary/10 text-secondary' : 'bg-zinc-200 text-zinc-600'}`}>{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right">{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
