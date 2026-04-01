import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
  datasources: [],
  dashboards: [],
  selectedDashboardId: null,
  panels: [],
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
}));

export default useStore;
