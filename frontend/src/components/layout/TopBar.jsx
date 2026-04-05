import React from 'react';
import { Edit2, Eye, Settings, Globe } from 'lucide-react';
import useStore from '../../stores/useStore';

export default function TopBar() {
  const { dashboards, selectedDashboardId, updateDashboard, isEditMode, setIsEditMode, setDashboardSettingsModalOpen, setPublishModalOpen } = useStore();
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
    <header className="w-full sticky top-0 z-40 bg-surface-container-lowest flex justify-between items-center px-8 h-12 border-b border-outline-variant/10">
      <div className="flex items-center gap-4">
        {isEditing && isEditMode ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="text-sm font-semibold tracking-tight text-on-surface bg-transparent border-b border-secondary outline-none px-1 py-0.5"
          />
        ) : (
          <div 
            onClick={() => isEditMode && setIsEditing(true)}
            className={`flex items-center gap-2 group ${isEditMode ? 'cursor-pointer text-on-surface-variant' : 'text-on-surface'}`}
          >
            <span className="text-sm font-semibold tracking-tight">
              {currentDashboard?.name || "Project Sales Dashboard"}
            </span>
            {isEditMode && <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant" />}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/10">
            <button
              onClick={() => setIsEditMode(false)}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${!isEditMode ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="View Mode"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${isEditMode ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Edit Mode"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPublishModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary-dim text-on-secondary text-xs font-bold rounded-lg transition-all shadow-md shadow-secondary/10"
                title="Publish Snapshot"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
              <button
                onClick={() => setDashboardSettingsModalOpen(true)}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all"
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
