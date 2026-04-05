import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AddChartModal from '../components/dashboard/AddChartModal';
import EditPanelModal from '../components/dashboard/EditPanelModal';
import DashboardPanelCard from '../components/dashboard/DashboardPanelCard';
import DashboardSettingsModal from '../components/dashboard/DashboardSettingsModal';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import FloatingToolbar from '../components/dashboard/FloatingToolbar';
import PublishModal from '../components/dashboard/PublishModal';
import useStore from '../stores/useStore';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardPage() {
  const { id } = useParams();
  const { panels, fetchPanels, setSelectedDashboardId, deletePanel, saveDashboardLayout, editingPanel, setEditingPanel, isEditMode } = useStore();

  useEffect(() => {
    if (id) {
      setSelectedDashboardId(id);
      fetchPanels(id);
    }
  }, [id]);

  const handleLayoutChange = (newLayout) => {
    if (!id || panels.length === 0 || !isEditMode) return;

    // Convert newLayout to backend format and only trigger update if something changed
    const updates = newLayout.map(item => ({
      id: item.i,
      layout: { x: item.x, y: item.y, w: item.w, h: item.h }
    }));

    saveDashboardLayout(id, updates);
  };

  const layout = panels.map(p => {
    let l = p.layout;
    if (typeof l === 'string') {
      try { l = JSON.parse(l); } catch (e) { l = null; }
    }
    return {
      i: p.id,
      x: l?.x || 0,
      y: l?.y || 0,
      w: l?.w || 4,
      h: l?.h || 3,
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <AddChartModal />
      <EditPanelModal
        panel={editingPanel}
        isOpen={!!editingPanel}
        onClose={() => setEditingPanel(null)}
      />
      <DashboardSettingsModal />
      <PublishModal />

      <DashboardFilters />

      {isEditMode && (
        <div className="fixed right-6 top-[20%] xl:right-10 z-50 pointer-events-auto transition-all duration-300">
          <FloatingToolbar />
        </div>
      )}

      {panels.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-2xl bg-surface-container-low/50">
          <p className="text-on-surface-variant font-medium">No charts yet. {isEditMode ? 'Click "Add Chart" to get started.' : 'Switch to Edit Mode to add charts.'}</p>
        </div>
      ) : (
        <div className="pb-10">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            draggableHandle=".drag-handle"
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onDragStop={handleLayoutChange}
            onResizeStop={handleLayoutChange}
            margin={[24, 24]}
          >
            {panels.map(panel => (
              <div key={panel.id}>
                <DashboardPanelCard panel={panel} onDelete={(panelId) => deletePanel(id, panelId)} />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      )}
    </div>
  );
}
