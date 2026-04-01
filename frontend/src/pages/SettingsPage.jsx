import React, { useState } from 'react';
import { Database, Link, Terminal, Search, Check, Table, ExpandMore, Info, BarChart3 } from 'lucide-react';
import axios from 'axios';
import useStore from '../stores/useStore';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: 'Production DB',
    host: 'localhost',
    port: 5432,
    database: 'analytics_db',
    user: 'admin',
    password: 'password'
  });
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0-4

  const handleScan = async () => {
    setScanning(true);
    // Simulated steps for UI wow-factor
    setScanStep(1); await new Promise(r => setTimeout(r, 1000));
    setScanStep(2); await new Promise(r => setTimeout(r, 1500));
    setScanStep(3); await new Promise(r => setTimeout(r, 1000));
    setScanStep(4);
    
    // In reality, this calls the backend agent
    // await axios.post(`/api/datasources/${id}/scan`);
    alert("Database scan complete! Manifest built.");
    setScanning(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="mb-16">
        <div className="flex justify-between items-end mb-4">
          <h1 className="font-bold text-[3rem] leading-none tracking-tighter text-zinc-900 dark:text-zinc-50">Setup Workspace</h1>
          <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-2">
            <Check className="w-3 h-3" />
            AI READINESS ACTIVE
          </div>
        </div>
        <p className="text-zinc-500 max-w-2xl text-lg">Connect your data architecture to the generative engine. Architect AI will map your schema and build a bespoke semantic model.</p>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Left Col: Config */}
        <div className="col-span-12 lg:col-span-7 space-y-12">
          <section>
            <h3 className="text-[10px] all-caps tracking-[0.1em] text-zinc-500 mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Link className="w-3 h-3" /> DATABASE CONNECTION
            </h3>
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Input label="Host Address" value={formData.host} />
                <Input label="Port" value={formData.port} />
              </div>
              <Input label="Database Name" value={formData.database} />
              <div className="grid grid-cols-2 gap-6">
                <Input label="Username" value={formData.user} />
                <Input label="Password" type="password" value={formData.password} />
              </div>
            </div>
          </section>

          <section>
             <h3 className="text-[10px] all-caps tracking-[0.1em] text-zinc-500 mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
               <Terminal className="w-3 h-3" /> AI SCANNER CONSOLE
             </h3>
             <div className="bg-zinc-950 p-8 rounded-xl shadow-2xl space-y-8 overflow-hidden relative">
               <button 
                 onClick={handleScan}
                 disabled={scanning}
                 className="w-full bg-white text-zinc-950 py-4 rounded-lg font-bold text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
               >
                 {scanning ? <span className="animate-spin material-symbols-outlined text-lg">sync</span> : <Search className="w-5 h-5" />}
                 Analyze Database Structure
               </button>
               
               <div className="space-y-4 font-mono">
                  <Step active={scanStep >= 1} text="Connecting to secure host..." time="240ms" />
                  <Step active={scanStep >= 2} text="Mapping relational tables..." time="1.2s" />
                  <Step active={scanStep >= 3} text="Identifying x-table constraints..." current={scanStep === 3} />
                  <Step active={scanStep >= 4} text="Building AI semantic model..." last={scanStep === 4} />
               </div>
             </div>
          </section>
        </div>

        {/* Right Col: Insights Preview */}
        <div className="col-span-12 lg:col-span-5">
           <h3 className="text-[10px] all-caps tracking-[0.1em] text-zinc-500 mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
             <Table className="w-3 h-3" /> DISCOVERED SCHEMA
           </h3>
           <div className="space-y-3">
              {[ { n: 'orders', c: 8 }, { n: 'customers', c: 12 }, { n: 'inventory', c: 5 } ].map(t => (
                <div key={t.n} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Table className="w-4 h-4 text-zinc-400 group-hover:text-secondary transition-colors" />
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{t.n}</span>
                    <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase text-zinc-500">{t.c} Cols</span>
                  </div>
                  <ExpandMore className="w-4 h-4 text-zinc-400" />
                </div>
              ))}
              
              <div className="mt-12 group relative rounded-xl h-64 grayscale opacity-40 hover:opacity-100 transition-all cursor-crosshair overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img 
                  src="https://lh3.googleusercontent.com/..." 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Schema Visualization"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542614391-460d3dcecc56?q=80&w=1000&auto=format&fit=crop"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                   <div className="flex items-center gap-3">
                     <BarChart3 className="w-5 h-5 text-white" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-white">Structural Integrity Mapped</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
      <input 
        {...props} 
        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 text-zinc-900 dark:text-zinc-50 font-mono text-sm" 
      />
    </div>
  );
}

function Step({ active, text, time, current, last }) {
  return (
    <div className={`flex items-center gap-4 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-20'}`}>
       <div className={`w-5 h-5 rounded-full flex items-center justify-center ${current ? 'bg-secondary animate-pulse' : active ? 'bg-secondary text-white' : 'border border-zinc-700'}`}>
         {active && !current && <Check className="w-3 h-3" />}
       </div>
       <span className={`text-sm ${active ? 'text-white' : 'text-zinc-600'} font-medium`}>{text}</span>
       {time && <span className="ml-auto text-[10px] font-mono text-zinc-500 uppercase">{time}</span>}
       {current && <span className="ml-auto text-[10px] font-mono text-secondary animate-pulse uppercase">Processing...</span>}
    </div>
  );
}
