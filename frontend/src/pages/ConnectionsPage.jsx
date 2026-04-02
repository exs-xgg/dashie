import React, { useState, useEffect, useMemo } from 'react';
import { Database, Terminal, Plus, Search, Trash2, Edit2, Globe, Server, Check, X, Shield, Lock, Activity } from 'lucide-react';
import useStore from '../stores/useStore';
import { format } from 'date-fns';

export default function ConnectionsPage() {
  const { datasources, mcpConnections, fetchDataSources, fetchMCPConnections, createDataSource, createMCPConnection, updateMCPConnection, deleteMCPConnection } = useStore();
  const [activeTab, setActiveTab] = useState('databases'); // databases, mcp
  const [isDBModalOpen, setIsDBModalOpen] = useState(false);
  const [isMCPModalOpen, setIsMCPModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'db'|'mcp', id: string }

  useEffect(() => {
    fetchDataSources();
    fetchMCPConnections();
  }, []);

  const handleOpenDBModal = (item = null) => {
    setEditingItem(item || { name: '', host: 'localhost', port: '5432', database: '', user: '', password: '', db_type: 'postgresql' });
    setIsDBModalOpen(true);
  };

  const handleOpenMCPModal = (item = null) => {
    setEditingItem(item || { name: '', server_url: '', api_key: '', description: '' });
    setIsMCPModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm.type === 'mcp') {
        await deleteMCPConnection(deleteConfirm.id);
    } else {
        // We'll add deleteDataSource to store if needed, let's assume we mainly edit for now
        // alert("DataSource deletion coming soon");
    }
    setDeleteConfirm(null);
  };

  const handleSaveDB = async (e) => {
    e.preventDefault();
    // In demo, we just create. In real app, we'd check if editingItem has an ID
    await createDataSource(editingItem);
    setIsDBModalOpen(false);
  };

  const handleSaveMCP = async (e) => {
    e.preventDefault();
    if (editingItem.id) {
        await updateMCPConnection(editingItem.id, editingItem);
    } else {
        await createMCPConnection(editingItem);
    }
    setIsMCPModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">Connections</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your data architecture and AI server integrations.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-10">
        <button 
          onClick={() => setActiveTab('databases')}
          className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'databases' ? 'text-secondary' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          Databases
          {activeTab === 'databases' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
        </button>
        <button 
          onClick={() => setActiveTab('mcp')}
          className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'mcp' ? 'text-secondary' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          Model Context Protocol (MCP)
          {activeTab === 'mcp' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
        </button>
      </div>

      {activeTab === 'databases' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4" /> Active Data Sources
            </h3>
            <button 
              onClick={() => handleOpenDBModal()}
              className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-800 transition-all uppercase tracking-tighter"
            >
              <Plus className="w-3.5 h-3.5" /> Register Database
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Connection</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {datasources.map((ds) => (
                  <tr 
                    key={ds.id} 
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 cursor-pointer group"
                    onClick={() => handleOpenDBModal(ds)}
                  >
                    <td className="px-6 py-5">
                       <div className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">{ds.name}</div>
                       <div className="text-[10px] text-zinc-400 font-medium">{ds.database}</div>
                    </td>
                    <td className="px-6 py-5">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                            {ds.db_type}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-mono text-zinc-500">
                        {ds.host}:{ds.port}
                    </td>
                    <td className="px-6 py-5">
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-tighter">
                          <Check className="w-3 h-3" /> Ready
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button className="p-1.5 text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-all">
                          <Edit2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'mcp' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* New MCP Card */}
           <button 
              onClick={() => handleOpenMCPModal()}
              className="h-56 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-secondary hover:border-secondary/50 hover:bg-secondary/5 transition-all group"
            >
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <Server className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Connect MCP Server</span>
            </button>

            {mcpConnections.map((mcp) => (
               <div 
                 key={mcp.id} 
                 onClick={() => handleOpenMCPModal(mcp)}
                 className="h-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col hover:shadow-xl transition-all cursor-pointer group"
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-zinc-950 dark:bg-zinc-900 rounded-xl">
                       <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${mcp.status === 'connected' ? 'bg-secondary/10 text-secondary' : 'bg-zinc-100 text-zinc-400'}`}>
                            {mcp.status}
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'mcp', id: mcp.id }); }}
                            className="p-1 text-zinc-400 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
                 <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">{mcp.name}</h3>
                 <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono break-all mb-4">{mcp.server_url}</p>
                 <div className="mt-auto pt-4 border-t border-zinc-50 dark:border-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase">
                        <Activity className="w-3 h-3" /> latency: 24ms
                    </div>
                    <Globe className="w-4 h-4 text-zinc-300" />
                 </div>
               </div>
            ))}
        </div>
      )}

      {/* DB Connection Modal */}
      {isDBModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <form onSubmit={handleSaveDB} className="flex">
               {/* Sidebar of the modal */}
               <div className="w-48 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Protocol</p>
                     {['postgresql', 'mysql', 'mongodb'].map(type => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => {
                            const ports = { postgresql: '5432', mysql: '3306', mongodb: '27017' };
                            setEditingItem({...editingItem, db_type: type, port: ports[type]});
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-xs font-bold transition-all uppercase tracking-tighter ${editingItem.db_type === type ? 'bg-secondary text-white' : 'text-zinc-500 hover:bg-zinc-200/50'}`}
                        >
                           {type}
                        </button>
                     ))}
                  </div>
                  <div className="pt-8 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                       <Shield className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-tighter">SSL Secured</span>
                    </div>
                  </div>
               </div>

               <div className="flex-1 p-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold">Database Access</h2>
                        <p className="text-zinc-500 text-sm">Provision credentials for dashie.</p>
                    </div>
                    <button type="button" onClick={() => setIsDBModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full"><X className="w-5 h-5"/></button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <Input 
                            label="Connection Name" 
                            placeholder="Production Read-Only" 
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        />
                        <Input 
                            label="Host" 
                            placeholder="db.example.com" 
                            value={editingItem.host}
                            onChange={(e) => setEditingItem({...editingItem, host: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <Input 
                            label="Port" 
                            value={editingItem.port}
                            onChange={(e) => setEditingItem({...editingItem, port: e.target.value})}
                        />
                        <div className="col-span-2">
                            <Input 
                                label="Database Name" 
                                value={editingItem.database}
                                onChange={(e) => setEditingItem({...editingItem, database: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Input 
                            label="User" 
                            value={editingItem.user}
                            onChange={(e) => setEditingItem({...editingItem, user: e.target.value})}
                        />
                        <Input 
                            label="Password" 
                            type="password" 
                            value={editingItem.password}
                            onChange={(e) => setEditingItem({...editingItem, password: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                        type="button"
                        className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl text-sm hover:bg-zinc-50"
                    >
                        Test Connection
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-bold text-sm shadow-xl"
                    >
                        Save Configuration
                    </button>
                  </div>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MCP Connection Modal */}
      {isMCPModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
             <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold">MCP Integration</h2>
                    <p className="text-zinc-500 text-sm">Add a semantic context provider.</p>
                </div>
                <button onClick={() => setIsMCPModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full"><X className="w-5 h-5"/></button>
             </div>

             <form onSubmit={handleSaveMCP} className="space-y-6">
                <Input 
                    label="Server Name" 
                    placeholder="Shared Context Server" 
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                />
                <Input 
                    label="Server URL (REST/WebSocket)" 
                    placeholder="https://mcp.yourdomain.com" 
                    value={editingItem.server_url}
                    onChange={(e) => setEditingItem({...editingItem, server_url: e.target.value})}
                />
                <div className="relative">
                    <Input 
                        label="API Authorization Key" 
                        type="password" 
                        value={editingItem.api_key}
                        onChange={(e) => setEditingItem({...editingItem, api_key: e.target.value})}
                    />
                    <Lock className="absolute right-4 top-10 w-4 h-4 text-zinc-300" />
                </div>
                <Input 
                    label="Description (Semantic Hint)" 
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                />

                <div className="flex gap-4 pt-6">
                    <button 
                        type="submit"
                        className="w-full bg-secondary text-white py-3 rounded-xl font-bold shadow-lg shadow-secondary/20"
                    >
                        {editingItem.id ? 'Update Connection' : 'Establish Connection'}
                    </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-4">Disconnect Server?</h3>
            <p className="text-zinc-500 mb-8">dashie will lose access to the context provided by this server. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 font-bold text-zinc-500 hover:text-zinc-700">Cancel</button>
              <button 
                onClick={handleDelete}
                className="flex-1 bg-error text-white py-3 rounded-xl font-bold shadow-lg shadow-error/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">{label}</label>
        <input 
          {...props} 
          className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 text-zinc-900 dark:text-zinc-50 text-sm font-medium transition-all" 
        />
      </div>
    );
  }
