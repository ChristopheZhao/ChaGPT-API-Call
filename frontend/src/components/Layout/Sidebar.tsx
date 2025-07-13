import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMessageSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useChatStore } from '../../stores/chatStore';
import './Sidebar.css';

interface SidebarProps {
  onCollapse?: () => void;
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapse, collapsed = false }) => {
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    setCurrentSession,
    updateSessionTitle,
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreateSession = () => {
    createSession();
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      return; // 保持至少一个会话
    }
    deleteSession(sessionId);
  };

  const handleEditStart = (sessionId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(sessionId);
    setEditingTitle(title);
  };

  const handleEditSave = (sessionId: string) => {
    if (editingTitle.trim()) {
      updateSessionTitle(sessionId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      handleEditSave(sessionId);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessage = (session: any) => {
    if (session.messages.length === 0) return 'No messages yet';
    const lastMessage = session.messages[session.messages.length - 1];
    const content = lastMessage.content.trim();
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-logo">
            <FiMessageSquare className="logo-icon" />
            <span className="app-name">ChatFlow</span>
          </div>
          
          <div className="header-actions">
            <button
              className="new-chat-btn"
              onClick={handleCreateSession}
              title="New Chat"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
              onClick={() => setCurrentSession(session.id)}
            >
              {editingId === session.id ? (
                <div className="session-edit">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyPress={(e) => handleEditKeyPress(e, session.id)}
                    onBlur={() => handleEditSave(session.id)}
                    autoFocus
                    className="edit-input"
                  />
                </div>
              ) : (
                <>
                  <div className="session-info">
                    <div className="session-title">{session.title}</div>
                    <div className="session-preview">{getLastMessage(session)}</div>
                    <div className="session-time">{formatDate(session.updatedAt)}</div>
                  </div>
                  
                  <div className="session-actions">
                    <button
                      className="session-action-btn"
                      onClick={(e) => handleEditStart(session.id, session.title, e)}
                      title="Edit title"
                    >
                      <FiEdit2 />
                    </button>
                    
                    {sessions.length > 1 && (
                      <button
                        className="session-action-btn delete-btn"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title="Delete session"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 悬浮的收起按钮 */}
      <button
        className="sidebar-collapse-btn"
        onClick={onCollapse}
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
    </div>
  );
};

export default Sidebar; 