import React from 'react';
import { Edit2, Eye, Settings } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function TopBar() {
  const { dashboards, selectedDashboardId, updateDashboard, isEditMode, setIsEditMode, setDashboardSettingsModalOpen } = useStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  const [editValue, setEditValue] = React.useState("");

  React.useEffect(() => {
    if (currentDashboard) {
      setEditValue(currentDashboard.name);
    }
  }, [currentDashboard]);

  const handleSave = async () => {
    if (editValue.trim() && editValue !== currentDashboard?.name) {
      await updateDashboard(selectedDashboardId, { name: editValue });
    }
    setIsEditing(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center px-8 h-12 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        {isEditing && isEditMode ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-secondary outline-none px-1 py-0.5"
          />
        ) : (
          <div 
            onClick={() => isEditMode && setIsEditing(true)}
            className={`flex items-center gap-2 group ${isEditMode ? 'cursor-pointer text-on-surface-variant' : 'text-zinc-900 dark:text-zinc-100'}`}
          >
            <span className="text-sm font-semibold tracking-tight">
              {currentDashboard?.name || "Project Sales Dashboard"}
            </span>
            {isEditMode && <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setIsEditMode(false)}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${!isEditMode ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              title="View Mode"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${isEditMode ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              title="Edit Mode"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDashboardSettingsModalOpen(true)}
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                title="Dashboard Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
