import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, VoiceConfig, ImageConfig, UIConfig } from '../types';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateVoiceConfig: (updates: Partial<VoiceConfig>) => void;
  updateImageConfig: (updates: Partial<ImageConfig>) => void;
  updateUIConfig: (updates: Partial<UIConfig>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'zh',
  apiEndpoint: 'http://127.0.0.1:9200',
  voice: {
    enabled: true,
    voice: 'alloy',
    autoPlay: false,
    speed: 1.0,
    streamingMode: false,
  },
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    quality: 0.8,
  },
  ui: {
    background: 'gradient',
    backgroundImage: '/backgrounds/anime_sakura.jpg',
    fontSize: 'medium',
    density: 'comfortable',
    showTimestamp: true,
    enableAnimations: true,
    compactMode: false,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateSettings: (updates: Partial<AppSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...updates },
        }));
      },
      
      updateVoiceConfig: (updates: Partial<VoiceConfig>) => {
        set(state => ({
          settings: {
            ...state.settings,
            voice: { ...state.settings.voice, ...updates },
          },
        }));
      },
      
      updateImageConfig: (updates: Partial<ImageConfig>) => {
        set(state => ({
          settings: {
            ...state.settings,
            image: { ...state.settings.image, ...updates },
          },
        }));
      },
      
      updateUIConfig: (updates: Partial<UIConfig>) => {
        set(state => ({
          settings: {
            ...state.settings,
            ui: { ...state.settings.ui, ...updates },
          },
        }));
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'settings-store',
    }
  )
); 