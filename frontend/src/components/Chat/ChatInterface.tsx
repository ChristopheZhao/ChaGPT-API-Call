import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useVoice } from '../../hooks/useVoice';
import { chatApi } from '../../services/api';
import ChatHeader from '../Layout/ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatInterface.css';

interface ChatInterfaceProps {
  onToggleSidebar: () => void;
  onToggleSettings: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onToggleSidebar, 
  onToggleSettings 
}) => {
  const {
    sessions,
    currentSessionId,
    getCurrentSession,
    createSession,
    addMessage,
    updateMessage,
    isStreaming,
    setStreaming,
    setLoading,
    currentModel
  } = useChatStore();

  const { settings } = useSettingsStore();
  const { playTTS } = useVoice();
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPlayedMessageRef = useRef<string | null>(null);

  // 如果没有会话，创建一个新会话
  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions.length, createSession]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSessionId]);

  // 当会话切换时，清理自动播放状态
  useEffect(() => {
    lastPlayedMessageRef.current = null;
  }, [currentSessionId]);

  // 自动播放新的助手消息
  useEffect(() => {
    const currentSession = getCurrentSession();
    if (!currentSession || !settings.voice.autoPlay || !settings.voice.enabled) return;

    // 找到最后一条助手消息
    const lastAssistantMessage = [...currentSession.messages]
      .reverse()
      .find(msg => msg.type === 'assistant' && !msg.isStreaming && msg.content);

    // 如果有新的助手消息且未播放过，则自动播放
    if (lastAssistantMessage && 
        lastAssistantMessage.id !== lastPlayedMessageRef.current &&
        lastAssistantMessage.content.trim()) {
      
      lastPlayedMessageRef.current = lastAssistantMessage.id;
      
      // 延迟播放，确保消息已完全渲染
      setTimeout(() => {
        playTTS(lastAssistantMessage.content);
      }, 500);
    }
  }, [getCurrentSession()?.messages, settings.voice.autoPlay, settings.voice.enabled, playTTS]);

  // 处理图像生成标记
  const processImageGenerationContent = (content: string) => {
    const imageMarkerRegex = /\[IMAGE:([^\]]+)\]/g;
    const match = imageMarkerRegex.exec(content);
    
    if (match) {
      const imageUrl = match[1];
      // 移除图像标记，保留其他文本
      const textContent = content.replace(imageMarkerRegex, '').trim();
      
      // 如果文本是描述性内容，替换为简短说明
      const isDescriptionText = textContent.includes('Description:') || 
                               textContent.includes('I\'ve generated an image for you') ||
                               textContent.length > 100;
      
      return {
        content: isDescriptionText ? 'Image generated' : (textContent || ''),
        imageUrl: imageUrl,
        hasImage: true
      };
    }
    
    return {
      content: content,
      imageUrl: undefined,
      hasImage: false
    };
  };

  // 发送消息
  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!currentSessionId) return;

    const userMessage = {
      type: 'user' as const,
      content,
      timestamp: Date.now(),
      imageUrl,
    };

    // 添加用户消息
    addMessage(currentSessionId, userMessage);

    // 创建助手消息
    const assistantMessage = {
      type: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    addMessage(currentSessionId, assistantMessage);

    // 获取刚添加的消息ID
    const session = getCurrentSession();
    const lastMessage = session?.messages[session.messages.length - 1];
    if (!lastMessage) return;

    setCurrentStreamingMessageId(lastMessage.id);
    setStreaming(true);

    try {
      let accumulatedContent = '';

      await chatApi.sendSmartRequest(
        content,
        (chunk: string) => {
          accumulatedContent += chunk;
          
          // 检查是否包含图像标记
          const processed = processImageGenerationContent(accumulatedContent);
          
          updateMessage(currentSessionId, lastMessage.id, {
            content: processed.content,
            imageUrl: processed.imageUrl,
            isStreaming: true,
          });
        },
        imageUrl,
        currentModel,
        () => {
          // 完成流式传输时再次处理内容
          const processed = processImageGenerationContent(accumulatedContent);
          
          updateMessage(currentSessionId, lastMessage.id, {
            content: processed.content,
            imageUrl: processed.imageUrl,
            isStreaming: false,
          });
          setStreaming(false);
          setCurrentStreamingMessageId(null);
        },
        (error: Error) => {
          console.error('Chat error:', error);
          updateMessage(currentSessionId, lastMessage.id, {
            content: `Error: ${error.message}`,
            isStreaming: false,
          });
          setStreaming(false);
          setCurrentStreamingMessageId(null);
        }
      );
    } catch (error) {
      console.error('Send message error:', error);
      updateMessage(currentSessionId, lastMessage.id, {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isStreaming: false,
      });
      setStreaming(false);
      setCurrentStreamingMessageId(null);
    }
  };
  
  const currentSession = getCurrentSession();

  // 动态背景样式（只应用到消息容器）
  const getMessagesBackgroundStyle = () => {
    if (!settings.ui) return {};
    
    switch (settings.ui.background) {
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed'
        };
      case 'gradient-purple':
        return {
          background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
          backgroundAttachment: 'fixed'
        };
      case 'gradient-pink':
        return {
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          backgroundAttachment: 'fixed'
        };
      case 'gradient-ocean':
        return {
          background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
          backgroundAttachment: 'fixed'
        };
      case 'gradient-sunset':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          backgroundAttachment: 'fixed'
        };
      case 'gradient-forest':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          backgroundAttachment: 'fixed'
        };
      case 'solid':
        return {
          background: '#f8fafc'
        };
      case 'dark':
        return {
          background: '#1e293b'
        };
      case 'image':
        return {
          backgroundImage: `url(${settings.ui.backgroundImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        };
      case 'none':
        return {
          background: '#ffffff'
        };
      default:
        return {
          background: '#f8fafc'
        };
    }
  };

  return (
    <div className="chat-interface">
      <ChatHeader 
        onToggleSidebar={onToggleSidebar}
        onToggleSettings={onToggleSettings}
      />
      
      <div className="chat-content">
        <div className="messages-container" style={getMessagesBackgroundStyle()}>
          <div className="messages-overlay">
            <MessageList
              messages={currentSession?.messages || []}
              isStreaming={isStreaming}
              currentStreamingMessageId={currentStreamingMessageId}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      <div className="chat-input-container">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default ChatInterface; 