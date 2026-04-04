import React, { useState } from 'react';
import { LayoutDashboard, Plus, MoreVertical, Trash2, Calendar, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { format } from 'date-fns';

export default function WorkspacePage() {
  const { dashboards, createDashboard } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDash, setNewDash] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDash.name.trim()) return;
    const created = await createDashboard(newDash);
    if (created) {
      setIsModalOpen(false);
      setNewDash({ name: '', description: '' });
      navigate(`/dashboard/${created.id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 whitespace-nowrap">Workspace</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and create your data visualization dashboards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Dashboard Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-48 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-secondary hover:border-secondary/50 hover:bg-secondary/5 transition-all group"
        >
          <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">New Dashboard</span>
        </button>

        {dashboards.map((dash) => (
          <div key={dash.id} className="h-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all group relative overflow-hidden">
            <Link 
              to={`/dashboard/${dash.id}`} 
              className="absolute inset-0 z-10"
            />
            <div className="relative z-0 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-secondary/10 text-secondary rounded-lg">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg mb-1 truncate">{dash.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{dash.description || "No description provided."}</p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-zinc-50 dark:border-zinc-900 pt-4 mt-auto">
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(dash.created_at), 'MMM d, yyyy')}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">Create Dashboard</h2>
              <p className="text-zinc-500 text-sm mb-8">Set a name and objective for your new workspace.</p>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dashboard Name</label>
                  <input 
                    autoFocus
                    required
                    value={newDash.name}
                    onChange={(e) => setNewDash({...newDash, name: e.target.value})}
                    placeholder="e.g., Executive Overview"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 text-zinc-900 dark:text-zinc-50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description (Optional)</label>
                  <textarea 
                    value={newDash.description}
                    onChange={(e) => setNewDash({...newDash, description: e.target.value})}
                    placeholder="Briefly describe the purpose of this dashboard..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 text-zinc-900 dark:text-zinc-50 h-32 resize-none" 
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 font-bold text-zinc-500 hover:text-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-secondary text-white py-3 rounded-xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary-dim transition-all"
                  >
                    Create Dashboard
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
