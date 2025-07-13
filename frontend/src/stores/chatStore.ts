import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Session, ModelConfig } from '../types';
import { nanoid } from 'nanoid';

interface ChatState {
  // 会话相关
  sessions: Session[];
  currentSessionId: string | null;
  
  // 模型配置
  models: ModelConfig[];
  currentModel: string;
  
  // UI状态
  isLoading: boolean;
  isStreaming: boolean;
  
  // 操作方法
  createSession: (title?: string) => string;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  
  // 消息操作
  addMessage: (sessionId: string, message: Omit<Message, 'id'>) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  clearMessages: (sessionId: string) => void;
  
  // 模型操作
  setCurrentModel: (modelName: string) => void;
  updateModels: (models: ModelConfig[]) => void;
  
  // 状态操作
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  
  // 工具方法
  getCurrentSession: () => Session | null;
  getSessionById: (sessionId: string) => Session | null;
}

// 默认模型配置
const defaultModels: ModelConfig[] = [
  { name: 'gpt-4o', displayName: 'GPT-4o', maxTokens: 4096, supportsVision: true },
  { name: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', maxTokens: 8192, supportsVision: true },
  { name: 'gpt-4o-mini', displayName: 'GPT-4o Mini', maxTokens: 4096, supportsVision: true },
  { name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', maxTokens: 4096, supportsVision: false },
];

// 辅助函数：清理消息中的大型数据以减少存储空间
const sanitizeMessageForStorage = (message: Message): Message => {
  const sanitized = { ...message };
  
  // 如果图片URL是base64数据且很大，则不保存到localStorage
  if (sanitized.imageUrl && sanitized.imageUrl.startsWith('data:')) {
    // 只保留前100个字符作为标识，实际图片数据不存储
    const prefix = sanitized.imageUrl.substring(0, 100);
    sanitized.imageUrl = `${prefix}...[IMAGE_DATA_REMOVED_FOR_STORAGE]`;
  }
  
  return sanitized;
};

// 辅助函数：清理会话数据以减少存储空间
const sanitizeSessionForStorage = (session: Session): Session => {
  return {
    ...session,
    messages: session.messages.map(sanitizeMessageForStorage)
  };
};

// 辅助函数：检查存储空间并清理旧数据
const cleanupStorageIfNeeded = (sessions: Session[]): Session[] => {
  try {
    // 测试存储空间
    const testData = JSON.stringify({ sessions, test: true });
    localStorage.setItem('storage-test', testData);
    localStorage.removeItem('storage-test');
    return sessions;
  } catch (error) {
    console.warn('Storage quota exceeded, cleaning up old sessions...');
    
    // 按更新时间排序，保留最近的10个会话
    const sortedSessions = [...sessions]
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 10);
    
    // 进一步清理：只保留每个会话的最后20条消息
    return sortedSessions.map(session => ({
      ...session,
      messages: session.messages.slice(-20).map(sanitizeMessageForStorage)
    }));
  }
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 初始状态
      sessions: [],
      currentSessionId: null,
      models: defaultModels,
      currentModel: 'gpt-4o',
      isLoading: false,
      isStreaming: false,
      
      // 会话操作
      createSession: (title?: string) => {
        const id = nanoid();
        const newSession: Session = {
          id,
          title: title || 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
        }));
        
        return id;
      },
      
      deleteSession: (sessionId: string) => {
        set(state => {
          const newSessions = state.sessions.filter(s => s.id !== sessionId);
          const newCurrentId = state.currentSessionId === sessionId
            ? (newSessions.length > 0 ? newSessions[0].id : null)
            : state.currentSessionId;
            
          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
          };
        });
      },
      
      setCurrentSession: (sessionId: string) => {
        set({ currentSessionId: sessionId });
      },
      
      updateSessionTitle: (sessionId: string, title: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title, updatedAt: Date.now() }
              : session
          ),
        }));
      },
      
      // 消息操作
      addMessage: (sessionId: string, message: Omit<Message, 'id'>) => {
        const id = nanoid();
        const newMessage: Message = {
          ...message,
          id,
        };
        
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },
      
      updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.map((msg: Message) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },
      
      deleteMessage: (sessionId: string, messageId: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.filter((msg: Message) => msg.id !== messageId),
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },
      
      clearMessages: (sessionId: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [],
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },
      
      // 模型操作
      setCurrentModel: (modelName: string) => {
        set({ currentModel: modelName });
      },
      
      updateModels: (models: ModelConfig[]) => {
        set({ models });
      },
      
      // 状态操作
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setStreaming: (streaming: boolean) => {
        set({ isStreaming: streaming });
      },
      
      // 工具方法
      getCurrentSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.currentSessionId) || null;
      },
      
      getSessionById: (sessionId: string) => {
        const state = get();
        return state.sessions.find(s => s.id === sessionId) || null;
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => {
        try {
          // 清理会话数据以减少存储空间
          const cleanedSessions = cleanupStorageIfNeeded(
            state.sessions.map(sanitizeSessionForStorage)
          );
          
          return {
            sessions: cleanedSessions,
            currentSessionId: state.currentSessionId,
            currentModel: state.currentModel,
            models: state.models,
          };
        } catch (error) {
          console.error('Error preparing data for storage:', error);
          // 如果出错，只保存基本信息
          return {
            sessions: [],
            currentSessionId: null,
            currentModel: state.currentModel,
            models: defaultModels,
          };
        }
      },
      // 添加存储错误处理
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating chat store:', error);
          // 清理损坏的存储数据
          try {
            localStorage.removeItem('chat-store');
          } catch (e) {
            console.error('Error clearing corrupted storage:', e);
          }
        } else if (state) {
          // 确保恢复的状态有完整的模型数据
          if (!state.models || state.models.length === 0) {
            state.models = defaultModels;
          }
          // 确保当前模型是有效的
          if (!state.currentModel || !state.models.find(m => m.name === state.currentModel)) {
            state.currentModel = defaultModels[0].name;
          }
        }
      },
    }
  )
); 