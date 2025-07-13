// API 响应类型
export interface ApiResponse {
  code: number;
  message: string;
  chunk?: string;
}

// 流式数据类型
export interface StreamData {
  code: number;
  message: string;
  chunk?: string;
  audio_data?: string;
}

// 消息类型
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  imageUrl?: string;
  isStreaming?: boolean;
}

// 会话类型
export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 模型配置类型
export interface ModelConfig {
  name: string;
  displayName: string;
  maxTokens: number;
  supportsVision: boolean;
}

// 语音配置类型
export interface VoiceConfig {
  enabled: boolean;
  voice: string;
  autoPlay: boolean;
  speed: number;
  streamingMode: boolean;
}

// 图像配置类型
export interface ImageConfig {
  maxSize: number;
  allowedTypes: string[];
  quality: number;
}

// UI配置类型
export interface UIConfig {
  background: 'gradient' | 'solid' | 'image';
  backgroundImage: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  showTimestamp: boolean;
  enableAnimations: boolean;
  compactMode: boolean;
}

// 应用设置类型
export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  apiEndpoint: string;
  voice: VoiceConfig;
  image: ImageConfig;
  ui: UIConfig;
} 