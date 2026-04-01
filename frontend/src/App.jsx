import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import useStore from './stores/useStore';

export default function App() {
  const { fetchDashboards, fetchDataSources } = useStore();

  useEffect(() => {
    fetchDashboards();
    fetchDataSources();
  }, []);

  return (
    <div className="flex bg-background min-h-screen text-on-surface">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 w-full max-w-screen-2xl mx-auto p-10 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
