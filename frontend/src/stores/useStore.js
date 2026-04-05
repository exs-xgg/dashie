import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
  datasources: [],
  dashboards: [],
  selectedDashboardId: null,
  panels: [],
  mcpConnections: [],
  snapshots: [],
  isAddChartModalOpen: false,
  isPublishModalOpen: false,
  isDashboardSettingsModalOpen: false,
  isEditMode: false, // Default to View Only
  dateRange: {
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  grouping: 'day', // Default grouping
  activeSchema: null,
  editingPanel: null,
  
  // Actions
  setIsEditMode: (isEditMode) => set({ isEditMode }),
  setGrouping: (grouping) => {
    set({ grouping });
    const id = get().selectedDashboardId;
    if (id) {
      localStorage.setItem(`dashie_grouping_${id}`, grouping);
    }
  },
  setEditingPanel: (panel) => set({ editingPanel: panel }),
  fetchDataSources: async () => {
    try {
      const res = await axios.get('/api/datasources');
      set({ datasources: res.data });
    } catch (err) {
      console.error("Failed to fetch datasources:", err);
    }
  },
  
  fetchDashboards: async () => {
    try {
      const res = await axios.get('/api/dashboards');
      set({ dashboards: res.data });
      if (res.data.length > 0 && !get().selectedDashboardId) {
        set({ selectedDashboardId: res.data[0].id });
      }
    } catch (err) {
      console.error("Failed to fetch dashboards:", err);
    }
  },
  
  fetchPanels: async (dashboardId) => {
    if (!dashboardId) return;
    try {
      const res = await axios.get(`/api/dashboards/${dashboardId}/panels`);
      set({ panels: res.data });
    } catch (err) {
      console.error("Failed to fetch panels:", err);
    }
  },
  
  saveDashboardLayout: async (dashboardId, layouts) => {
    try {
      await axios.put(`/api/dashboards/${dashboardId}/panels/layout`, { layouts });
    } catch (err) {
      console.error("Failed to save dashboard layout:", err);
    }
  },

  createPanel: async (dashboardId, data) => {
    try {
      const res = await axios.post(`/api/dashboards/${dashboardId}/panels`, data);
      set((state) => ({ panels: [...state.panels, res.data] }));
      return res.data;
    } catch (err) {
      console.error("Failed to create panel:", err);
      throw err;
    }
  },

  addTextPanel: async (dashboardId, type = 'title') => {
    const data = {
      title: type === 'title' ? 'New Title' : 'New Caption',
      content: type === 'title' ? '# New Title' : 'Write your caption here...',
      chart_type: 'text',
      layout: { w: type === 'title' ? 12 : 4, h: 1, x: 0, y: Infinity },
      chart_config: { text_type: type }
    };
    return get().createPanel(dashboardId, data);
  },

  deletePanel: async (dashboardId, panelId) => {
     try {
       await axios.delete(`/api/dashboards/${dashboardId}/panels/${panelId}`);
       set((state) => ({ panels: state.panels.filter(p => p.id !== panelId) }));
     } catch (err) {
       console.error("Failed to delete panel:", err);
     }
  },
  
  fixPanel: async (panelId, errorMessage) => {
    try {
      const res = await axios.post(`/api/query/fix`, {
        panel_id: panelId,
        error_message: errorMessage
      });
      // Update the panel in the store
      set((state) => ({
        panels: state.panels.map(p => p.id === panelId ? res.data : p)
      }));
      return res.data;
    } catch (err) {
      console.error("Failed to fix panel:", err);
      throw err;
    }
  },

  executePanelQuery: async (datasourceId, sql) => {
    try {
      const { dateRange, grouping } = get();
      const res = await axios.post(`/api/query/execute?datasource_id=${datasourceId}`, {
        sql,
        date_range: dateRange,
        grouping: grouping
      });
      return res.data;
    } catch (err) {
      console.error("Failed to execute panel query:", err);
      throw err;
    }
  },

  generateQuery: async (datasourceId, prompt, chartType = null) => {
    try {
      let url = `/api/query/generate?datasource_id=${datasourceId}&prompt=${encodeURIComponent(prompt)}`;
      if (chartType && chartType !== 'auto') {
         url += `&chart_type=${encodeURIComponent(chartType)}`;
      }
      const res = await axios.post(url);
      return res.data;
    } catch (err) {
      console.error("Failed to generate query:", err);
      throw err;
    }
  },
  fetchQuerySuggestions: async (datasourceId) => {
    try {
      const res = await axios.get(`/api/query/suggestions/${datasourceId}`);
      return res.data.suggestions || [];
    } catch (err) {
      console.error("Failed to fetch query suggestions:", err);
      return [];
    }
  },
  
  setDateRange: (range) => {
    set({ dateRange: range });
    const id = get().selectedDashboardId;
    if (id) {
      localStorage.setItem(`dashie_date_range_${id}`, JSON.stringify(range));
    }
  },
  setSelectedDashboardId: (id) => {
    set({ selectedDashboardId: id });
    if (id) {
      const savedRange = localStorage.getItem(`dashie_date_range_${id}`);
      if (savedRange) {
        try {
          set({ dateRange: JSON.parse(savedRange) });
        } catch (e) {
          console.error("Failed to parse saved date range", e);
        }
      }
      const savedGrouping = localStorage.getItem(`dashie_grouping_${id}`);
      if (savedGrouping) {
        set({ grouping: savedGrouping });
      }
    }
  },
  setAddChartModalOpen: (isOpen) => set({ isAddChartModalOpen: isOpen }),
  setPublishModalOpen: (isOpen) => set({ isPublishModalOpen: isOpen }),
  setDashboardSettingsModalOpen: (isOpen) => set({ isDashboardSettingsModalOpen: isOpen }),

  // CRUD Dashboards
  createDashboard: async (data) => {
    try {
      const res = await axios.post('/api/dashboards', data);
      set((state) => ({ dashboards: [...state.dashboards, res.data] }));
      return res.data;
    } catch (err) {
      console.error("Failed to create dashboard:", err);
    }
  },
  deleteDashboard: async (id) => {
    try {
      await axios.delete(`/api/dashboards/${id}`);
      set((state) => ({ dashboards: state.dashboards.filter(d => d.id !== id) }));
    } catch (err) {
      console.error("Failed to delete dashboard:", err);
    }
  },
  
  updateDashboard: async (id, data) => {
    try {
      const res = await axios.patch(`/api/dashboards/${id}`, data);
      set((state) => ({ 
        dashboards: state.dashboards.map(d => d.id === id ? res.data : d)
      }));
      return res.data;
    } catch (err) {
      console.error("Failed to update dashboard:", err);
    }
  },
  
  updatePanel: async (dashboardId, panelId, data) => {
    try {
      const res = await axios.patch(`/api/dashboards/${dashboardId}/panels/${panelId}`, data);
      set((state) => ({
        panels: state.panels.map(p => p.id === panelId ? res.data : p)
      }));
      return res.data;
    } catch (err) {
      console.error("Failed to update panel:", err);
      throw err;
    }
  },

  // CRUD Data Sources
  createDataSource: async (data) => {
    try {
      const res = await axios.post('/api/datasources', data);
      set((state) => ({ datasources: [...state.datasources, res.data] }));
      return res.data;
    } catch (err) {
      console.error("Failed to create datasource:", err);
    }
  },

  deleteDataSource: async (id) => {
    try {
      await axios.delete(`/api/datasources/${id}`);
      set((state) => ({ datasources: state.datasources.filter(d => d.id !== id) }));
    } catch (err) {
      console.error("Failed to delete datasource:", err);
    }
  },

  testConnection: async (data) => {
    try {
      const res = await axios.post('/api/datasources/test-connection', data);
      return res.data;
    } catch (err) {
      console.error("Failed to test connection:", err);
      throw err;
    }
  },

  syncDataSourceSchema: async (id) => {
    try {
      const res = await axios.post(`/api/datasources/${id}/scan`);
      return res.data;
    } catch (err) {
      console.error("Failed to sync datasource schema:", err);
      throw err;
    }
  },

  fetchDataSourceSchema: async (id) => {
    try {
      set({ activeSchema: null });
      const res = await axios.get(`/api/datasources/${id}/schema`);
      set({ activeSchema: res.data });
      return res.data;
    } catch (err) {
      console.error("Failed to fetch schema:", err);
      throw err;
    }
  },

  // CRUD MCP Connections
  fetchMCPConnections: async () => {
    try {
      const res = await axios.get('/api/mcp-connections');
      set({ mcpConnections: res.data });
    } catch (err) {
      console.error("Failed to fetch MCP connections:", err);
    }
  },
  createMCPConnection: async (data) => {
    try {
      const res = await axios.post('/api/mcp-connections', data);
      set((state) => ({ mcpConnections: [...state.mcpConnections, res.data] }));
      return res.data;
    } catch (err) {
      console.error("Failed to create MCP connection:", err);
    }
  },
  updateMCPConnection: async (id, data) => {
    try {
      const res = await axios.patch(`/api/mcp-connections/${id}`, data);
      set((state) => ({
        mcpConnections: state.mcpConnections.map(c => c.id === id ? res.data : c)
      }));
      return res.data;
    } catch (err) {
      console.error("Failed to update MCP connection:", err);
    }
  },
  deleteMCPConnection: async (id) => {
    try {
      await axios.delete(`/api/mcp-connections/${id}`);
      set((state) => ({
        mcpConnections: state.mcpConnections.filter(c => c.id !== id)
      }));
    } catch (err) {
      console.error("Failed to delete MCP connection:", err);
    }
  },

  // Snapshot Actions
  createSnapshot: async (data) => {
    try {
      const res = await axios.post('/api/snapshots', data);
      set((state) => ({ snapshots: [res.data, ...state.snapshots] }));
      return res.data;
    } catch (err) {
      console.error("Failed to create snapshot:", err);
      throw err;
    }
  },
  fetchSnapshots: async (dashboardId) => {
    try {
      const res = await axios.get(`/api/snapshots/dashboard/${dashboardId}`);
      set({ snapshots: res.data });
    } catch (err) {
      console.error("Failed to fetch snapshots:", err);
    }
  },
  fetchSnapshot: async (snapshotId) => {
    try {
      const res = await axios.get(`/api/snapshots/${snapshotId}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch snapshot:", err);
      throw err;
    }
  },
}));

export default useStore;
