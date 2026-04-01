import React, { useState } from 'react';
import { AutoAwesome } from 'lucide-react';
import { Search, Wand2, Sparkles } from 'lucide-react';

export default function QueryInput() {
  const [prompt, setPrompt] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && prompt.trim()) {
      // Trigger NL to SQL generation logic
      alert("Generating query for: " + prompt);
      setPrompt("");
    }
  };

  return (
    <section className="mb-16 flex justify-center">
      <div className="w-full max-w-3xl relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
          <Sparkles className="w-6 h-6 text-secondary" style={{ fill: 'currentColor' }} />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Show me top 10 products by revenue this month."
          className="w-full h-16 pl-16 pr-24 bg-white dark:bg-zinc-900 border-none shadow-[0px_12px_40px_rgba(45,52,53,0.06)] dark:shadow-none rounded-2xl text-lg font-medium placeholder:text-zinc-400 focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-500 shadow-sm uppercase tracking-tighter">
            ⌘ K
          </kbd>
          <button 
            disabled={!prompt.trim()}
            className="p-2 bg-secondary text-white rounded-lg hover:bg-secondary-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// Fixed Lucide import check below
import { ChevronRight } from 'lucide-react';
