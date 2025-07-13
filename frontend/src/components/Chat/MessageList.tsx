import React from 'react';
import type { Message } from '../../types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  currentStreamingMessageId: string | null;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  currentStreamingMessageId,
}) => {
  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Start a conversation</h3>
          <p>Send a message to begin chatting with AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isStreaming={message.id === currentStreamingMessageId}
        />
      ))}
    </div>
  );
};

export default MessageList; 