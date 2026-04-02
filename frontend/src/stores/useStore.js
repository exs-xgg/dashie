import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
  datasources: [],
  dashboards: [],
  selectedDashboardId: null,
  panels: [],
  mcpConnections: [],
  dateRange: {
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  
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
  
  setDateRange: (range) => set({ dateRange: range }),
  setSelectedDashboardId: (id) => set({ selectedDashboardId: id }),

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
