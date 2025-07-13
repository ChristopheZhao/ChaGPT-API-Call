import React from 'react';
import { FiSettings, FiMenu } from 'react-icons/fi';
import { useChatStore } from '../../stores/chatStore';
import ModelSelector from '../Chat/ModelSelector';
import './ChatHeader.css';

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
  onToggleSettings?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onToggleSidebar, onToggleSettings }) => {
  const { getCurrentSession } = useChatStore();
  
  const currentSession = getCurrentSession();

  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        >
          <FiMenu />
        </button>
        
        <div className="session-title">
          {currentSession?.title || 'New Chat'}
        </div>
      </div>

      <div className="chat-header-center">
        <ModelSelector />
      </div>

      <div className="chat-header-right">
        <button
          className="settings-toggle-btn"
          onClick={onToggleSettings}
          title="Settings"
        >
          <FiSettings />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader; 