import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiImage, FiMic, FiMicOff, FiX } from 'react-icons/fi';
import { imageApi } from '../../services/api';
import { useVoice } from '../../hooks/useVoice';
import { useSettingsStore } from '../../stores/settingsStore';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { speechToText } = useVoice();
  const { settings } = useSettingsStore();

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    try {
      let imageUrl: string | undefined;

      if (selectedImage) {
        // 压缩图片以减少存储空间
        try {
          const compressedImage = await imageApi.compressImage(selectedImage, 0.7);
          const compressedFile = new File([compressedImage], selectedImage.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          imageUrl = await imageApi.imageToBase64(compressedFile);
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError);
          imageUrl = await imageApi.imageToBase64(selectedImage);
        }
      }

      const content = message.trim() || (selectedImage ? '图片' : '');
      onSendMessage(content, imageUrl);
      
      // 清空输入
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        
        try {
          const transcribedText = await speechToText(audioFile);
          if (transcribedText) {
            setMessage(prev => prev + transcribedText);
          }
        } catch (error) {
          console.error('Speech recognition error:', error);
        }
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setMediaRecorder(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
          <button type="button" onClick={removeImage} className="remove-image">
            <FiX />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "正在录音..." : placeholder}
            disabled={disabled || isRecording}
            className={`message-textarea ${isRecording ? 'recording' : ''}`}
            rows={1}
          />
          
          <div className="input-actions">
            {/* 语音输入按钮 */}
            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              title={isRecording ? "停止录音" : "语音输入"}
              disabled={disabled}
            >
              {isRecording ? <FiMicOff /> : <FiMic />}
            </button>

            {/* 图片上传按钮 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="image-button"
              title="添加图片"
              disabled={disabled}
            >
              <FiImage />
            </button>

            {/* 发送按钮 */}
            <button
              type="submit"
              disabled={disabled || (!message.trim() && !selectedImage)}
              className="send-button"
              title="发送消息"
            >
              <FiSend />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </form>
    </div>
  );
};

export default MessageInput; 