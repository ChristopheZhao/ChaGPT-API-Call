import axios from 'axios';
import type { ApiResponse, Message, StreamData } from '../types';

// API 基础配置
const API_BASE_URL = 'http://127.0.0.1:9200';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 流式请求处理
export const streamRequest = async (
  url: string,
  data: any,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onComplete?.();
            return;
          }

          try {
            const parsed: ApiResponse = JSON.parse(data);
            if (parsed.chunk) {
              onChunk(parsed.chunk);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error as Error);
  }
};

// ChatGPT API 服务
export const chatApi = {
  // 发送消息 (流式)
  sendMessage: async (
    message: string,
    onChunk: (chunk: string) => void,
    model?: string,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> => {
    return streamRequest(
      '/request_openai',
      { user_input: message, model: model },
      onChunk,
      onComplete,
      onError
    );
  },

  // 智能多模态请求
  sendSmartRequest: async (
    message: string,
    onChunk: (chunk: string) => void,
    imageUrl?: string,
    model?: string,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> => {
    return streamRequest(
      '/request_smart',
      { user_input: message, image_url: imageUrl, model: model },
      onChunk,
      onComplete,
      onError
    );
  },
};

// 语音API服务
export const voiceApi = {
  // 语音识别
  speechToText: async (audioFile: File, language?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (language) {
      formData.append('language', language);
    }

    const response = await api.post('/speech_to_text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.code === 0) {
      return response.data.text;
    } else {
      throw new Error(response.data.message || 'Speech recognition failed');
    }
  },

  // 文本转语音
  textToSpeech: async (text: string, voice: string = 'alloy'): Promise<Blob> => {
    const response = await api.post('/text_to_speech', {
      text,
      voice,
    }, {
      responseType: 'blob',
    });

    return response.data;
  },

  // 流式文本转语音
  textToSpeechStream: async (
    text: string,
    voice: string = 'alloy',
    onChunk: (data: StreamData) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/text_to_speech_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete?.();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onComplete?.();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.code === 0) {
                onChunk(parsed);
              }
            } catch (e) {
              console.error('Error parsing TTS chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
    }
  },
};

// 图像API服务
export const imageApi = {
  // 图像转base64
  imageToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // 图像压缩
  compressImage: (file: File, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', quality);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },
};

export default api; 