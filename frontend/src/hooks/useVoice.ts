import { useState, useCallback, useRef } from 'react';
import { voiceApi } from '../services/api';
import { useSettingsStore } from '../stores/settingsStore';

export const useVoice = () => {
  const { settings } = useSettingsStore();
  const { voice: voiceConfig } = settings;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTTS = useCallback(async (text: string) => {
    if (!voiceConfig.enabled || !text.trim()) return;

    try {
      setIsPlaying(true);
      
      // 停止当前播放的音频
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      const audioBlob = await voiceApi.textToSpeech(text, voiceConfig.voice);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audioRef.current = audio;
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback failed');
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, [voiceConfig.enabled, voiceConfig.voice, currentAudio]);

  const stopTTS = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  const speechToText = useCallback(async (audioFile: File): Promise<string> => {
    if (!voiceConfig.enabled) {
      throw new Error('Voice mode is disabled');
    }

    try {
      return await voiceApi.speechToText(audioFile);
    } catch (error) {
      console.error('Speech recognition error:', error);
      throw error;
    }
  }, [voiceConfig.enabled]);

  return {
    isPlaying,
    playTTS,
    stopTTS,
    speechToText,
    isVoiceEnabled: voiceConfig.enabled,
    voiceConfig,
  };
};

export default useVoice; 