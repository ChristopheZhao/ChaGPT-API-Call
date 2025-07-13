import React, { useState } from 'react';
import { FiPlus, FiX, FiEdit2, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useChatStore } from '../../stores/chatStore';

const SessionTabs: React.FC = () => {
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

  return (
    <div className="session-tabs">
      <div className="tabs-container">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-tab ${session.id === currentSessionId ? 'active' : ''}`}
            onClick={() => setCurrentSession(session.id)}
          >
            <div className="tab-content">
              {editingId === session.id ? (
                <div className="tab-edit">
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
                  <div className="tab-info">
                    <div className="tab-title">{session.title}</div>
                    <div className="tab-meta">
                      {session.messages.length} messages • {formatDate(session.updatedAt)}
                    </div>
                  </div>
                  
                  <div className="tab-actions">
                    <button
                      className="tab-action-btn edit-btn"
                      onClick={(e) => handleEditStart(session.id, session.title, e)}
                      title="Edit title"
                    >
                      <FiEdit2 />
                    </button>
                    
                    {sessions.length > 1 && (
                      <button
                        className="tab-action-btn delete-btn"
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
          </div>
        ))}
        
        <button
          className="new-session-btn"
          onClick={handleCreateSession}
          title="New session"
        >
          <FiPlus />
          New Chat
        </button>
      </div>
    </div>
  );
};

export default SessionTabs; 