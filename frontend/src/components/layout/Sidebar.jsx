import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const navItems = [
    { name: 'Workspace', icon: LayoutDashboard, path: '/' },
    { name: 'Connections', icon: Database, path: '/connections' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col py-6 px-4 z-50">
      <div className="mb-12 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none">Architect AI</h2>
          <p className="text-[10px] text-zinc-500 tracking-wider uppercase mt-1">v1.2.0-beta</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50" 
                : "text-zinc-500 hover:text-secondary dark:hover:text-secondary"
            )}
          >
            <item.icon className={cn("w-4 h-4", item.path === '/' && "text-secondary")} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <NavLink to="/support" className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-zinc-500 hover:text-secondary">
          <HelpCircle className="w-4 h-4" />
          Support
        </NavLink>
        <NavLink to="/docs" className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-zinc-500 hover:text-secondary">
          <FileText className="w-4 h-4" />
          Docs
        </NavLink>
        <button className="w-full mt-4 bg-secondary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary-dim transition-colors shadow-sm shadow-secondary/20">
          Deploy
        </button>
      </div>
    </aside>
  );
}
