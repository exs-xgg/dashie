import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, HelpCircle, FileText } from 'lucide-react';
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
    <aside className="w-64 h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-6 px-4 z-50">
      <div className="mb-12 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center shadow-lg shadow-secondary/10">
          <span className="material-symbols-outlined text-white scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
        </div>
        <div>
          <h2 className="text-2xl font-logo text-primary leading-none lowercase tracking-wide">dashie.</h2>
          <p className="text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mt-1 font-bold opacity-70">insight engine</p>
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
                ? "bg-surface-container-lowest shadow-sm text-on-surface"
                : "text-on-surface-variant hover:text-secondary"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-4 h-4", isActive && "text-secondary")} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-outline-variant/10">
        <NavLink to="/support" className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-on-surface-variant hover:text-secondary">
          <HelpCircle className="w-4 h-4" />
          Support
        </NavLink>
        <NavLink to="/docs" className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-on-surface-variant hover:text-secondary">
          <FileText className="w-4 h-4" />
          Docs
        </NavLink>
        <button className="w-full mt-4 bg-secondary text-on-secondary py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary-dim transition-colors shadow-sm">
          Deploy
        </button>
      </div>
    </aside>
  );
}
