import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiUser, FiCpu, FiCopy, FiCheck, FiPlay, FiPause, FiDownload } from 'react-icons/fi';
import type { Message } from '../../types';
import { useState } from 'react';
import { useVoice } from '../../hooks/useVoice';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming }) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isPlaying, playTTS, stopTTS, isVoiceEnabled } = useVoice();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handlePlay = async () => {
    if (isPlaying) {
      stopTTS();
    } else {
      await playTTS(message.content);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDownloadImage = async () => {
    if (!message.imageUrl) return;
    
    try {
      const response = await fetch(message.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleRetryImage = () => {
    setImageError(false);
    setImageLoaded(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 判断是否显示内容：没有图像或图像已加载成功
  const shouldShowContent = !message.imageUrl || imageLoaded;

  return (
    <div className={`message ${message.type} ${isStreaming ? 'streaming' : ''}`}>
      <div className="message-avatar">
        {message.type === 'user' ? '👤' : '🤖'}
      </div>
      
      <div className="message-content">
        {/* 如果有图像，先显示文字说明（仅在图像加载成功后显示） */}
        {message.imageUrl && shouldShowContent && message.content && (
          <div className="message-text">
            {message.type === 'assistant' ? (
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    return isInline ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div>{message.content}</div>
            )}
          </div>
        )}
        
        {/* 显示图像 */}
        {message.imageUrl && (
          <div className="message-image-container">
            {!imageLoaded && !imageError && (
              <div className="image-loading">
                <div className="loading-spinner"></div>
                <span>正在生成图像...</span>
              </div>
            )}
            {imageError ? (
              <div className="image-error">
                <span>❌ 图像加载失败</span>
                <button onClick={handleRetryImage}>
                  重试
                </button>
              </div>
            ) : (
              <img 
                src={message.imageUrl} 
                alt="Generated image" 
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
            )}
          </div>
        )}
        
        {/* 如果没有图像，显示普通文本内容 */}
        {!message.imageUrl && message.content && (
          <div className="message-text">
            {message.type === 'assistant' ? (
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    return isInline ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div>{message.content}</div>
            )}
          </div>
        )}
        
        {/* 只有在内容应该显示时才显示时间戳和操作按钮 */}
        {shouldShowContent && (
          <>
            <div className="message-timestamp">
              {formatTime(message.timestamp)}
            </div>
            
            {message.type === 'assistant' && (message.content || message.imageUrl) && (
              <div className="message-actions">
                {message.imageUrl && imageLoaded && (
                  <button
                    className="message-action-btn"
                    onClick={handleDownloadImage}
                    title="Download image"
                  >
                    <FiDownload />
                  </button>
                )}
                {isVoiceEnabled && message.content && (
                  <button
                    className="message-action-btn"
                    onClick={handlePlay}
                    title={isPlaying ? 'Stop playing' : 'Play message'}
                  >
                    {isPlaying ? <FiPause /> : <FiPlay />}
                  </button>
                )}
                {message.content && (
                  <button
                    className="message-action-btn"
                    onClick={handleCopy}
                    title="Copy message"
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageItem; 