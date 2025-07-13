import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import ChatInterface from './components/Chat/ChatInterface';
import SettingsPanel from './components/Settings/SettingsPanel';
import { useSettingsStore } from './stores/settingsStore';
import { cleanupCorruptedStorage } from './utils/storageCleanup';
import './App.css';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 应用启动时清理损坏的存储数据
  useEffect(() => {
    cleanupCorruptedStorage();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const collapseSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app">
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar onCollapse={collapseSidebar} collapsed={sidebarCollapsed} />
      </div>
      
      <div className="main-container">
        <ChatInterface 
          onToggleSidebar={toggleSidebar}
          onToggleSettings={toggleSettings}
        />
      </div>
      
      {/* 设置面板 */}
      <SettingsPanel 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      
      {/* 侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
