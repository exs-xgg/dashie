import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
  datasources: [],
  dashboards: [],
  selectedDashboardId: null,
  panels: [],
  mcpConnections: [],
  isAddChartModalOpen: false,
  dateRange: {
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  activeSchema: null,
  
  // Actions
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
      const { dateRange } = get();
      const res = await axios.post(`/api/query/execute?datasource_id=${datasourceId}`, {
        sql,
        date_range: dateRange
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
  
  setDateRange: (range) => set({ dateRange: range }),
  setSelectedDashboardId: (id) => set({ selectedDashboardId: id }),
  setAddChartModalOpen: (isOpen) => set({ isAddChartModalOpen: isOpen }),

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
}));

export default useStore;
