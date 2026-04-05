import React, { useState, useId } from 'react';
import { Database, Link, Terminal, Search, Check, Table, ChevronDown, BarChart3 } from 'lucide-react';

export default function SettingsPage() {
  const [formData] = useState({
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
    
    alert("Database scan complete! Manifest built.");
    setScanning(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="mb-16">
        <div className="flex justify-between items-end mb-4">
          <h1 className="font-bold text-[3.5rem] leading-none tracking-tighter text-on-surface">Setup Workspace</h1>
          <div className="bg-secondary/10 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-2">
            <Check className="w-3 h-3" />
            AI READINESS ACTIVE
          </div>
        </div>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium">Connect your data architecture to the generative engine. dashie will map your schema and build a bespoke semantic model.</p>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Left Col: Config */}
        <div className="col-span-12 lg:col-span-7 space-y-12">
          <section>
            <h3 className="text-[10px] all-caps tracking-[0.1em] text-on-surface-variant mb-6 flex items-center gap-2 border-b border-outline-variant/10 pb-2 font-bold">
              <Link className="w-3 h-3" /> DATABASE CONNECTION
            </h3>
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/15 shadow-sm space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Input label="Host Address" id="host" name="host" value={formData.host} readOnly />
                <Input label="Port" id="port" name="port" value={formData.port} readOnly />
              </div>
              <Input label="Database Name" id="database" name="database" value={formData.database} readOnly />
              <div className="grid grid-cols-2 gap-6">
                <Input label="Username" id="user" name="user" value={formData.user} readOnly />
                <Input label="Password" id="password" name="password" type="password" value={formData.password} readOnly />
              </div>
            </div>
          </section>

          <section>
             <h3 className="text-[10px] all-caps tracking-[0.1em] text-on-surface-variant mb-6 flex items-center gap-2 border-b border-outline-variant/10 pb-2 font-bold">
               <Terminal className="w-3 h-3" /> AI SCANNER CONSOLE
             </h3>
             <div className="bg-on-surface p-8 rounded-xl shadow-2xl space-y-8 overflow-hidden relative">
               <button 
                 onClick={handleScan}
                 disabled={scanning}
                 className="w-full bg-surface-container-lowest text-on-surface py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
               >
                 {scanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
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
           <h3 className="text-[10px] all-caps tracking-[0.1em] text-on-surface-variant mb-6 flex items-center gap-2 border-b border-outline-variant/10 pb-2 font-bold">
             <Table className="w-3 h-3" /> DISCOVERED SCHEMA
           </h3>
           <div className="space-y-3">
              {[ { n: 'orders', c: 8 }, { n: 'customers', c: 12 }, { n: 'inventory', c: 5 } ].map(t => (
                <div key={t.n} className="p-4 bg-surface-container-lowest border border-outline-variant/15 rounded-xl flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Table className="w-4 h-4 text-on-surface-variant group-hover:text-secondary transition-colors" />
                    <span className="font-bold text-on-surface">{t.n}</span>
                    <span className="text-[9px] bg-surface-container-low px-1.5 py-0.5 rounded font-bold uppercase text-on-surface-variant">{t.c} Cols</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                </div>
              ))}
              
              <div className="mt-12 group relative rounded-xl h-64 grayscale opacity-40 hover:opacity-100 transition-all cursor-crosshair overflow-hidden border border-outline-variant/15">
                <img 
                  src="/assets/schema-visualization.png" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Schema Visualization"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-6">
                   <div className="flex items-center gap-3">
                     <BarChart3 className="w-5 h-5 text-surface-container-lowest" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-surface-container-lowest">Structural Integrity Mapped</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, id: customId, ...props }) {
  const generatedId = useId();
  const id = customId || generatedId;
  
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer">
        {label}
      </label>
      <input 
        id={id}
        {...props} 
        className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 text-on-surface font-mono text-sm"
      />
    </div>
  );
}

function Step({ active, text, time, current }) {
  return (
    <div className={`flex items-center gap-4 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-20'}`}>
       <div className={`w-5 h-5 rounded-full flex items-center justify-center ${current ? 'bg-secondary animate-pulse' : active ? 'bg-secondary text-surface-container-lowest' : 'border border-outline-variant/30'}`}>
         {active && !current && <Check className="w-3 h-3" />}
       </div>
       <span className={`text-sm ${active ? 'text-surface-container-lowest' : 'text-on-surface-variant'} font-medium`}>{text}</span>
       {time && <span className="ml-auto text-[10px] font-mono text-on-surface-variant uppercase">{time}</span>}
       {current && <span className="ml-auto text-[10px] font-mono text-secondary animate-pulse uppercase">Processing...</span>}
    </div>
  );
}

function RefreshCw(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
