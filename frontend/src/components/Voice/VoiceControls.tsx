import React from 'react';
import { FiVolume2, FiVolumeX, FiSettings } from 'react-icons/fi';
import { useSettingsStore } from '../../stores/settingsStore';
import './VoiceControls.css';

const VoiceControls: React.FC = () => {
  const { settings, updateVoiceConfig } = useSettingsStore();
  const { voice: voiceConfig } = settings;

  const toggleAutoPlay = () => {
    updateVoiceConfig({ autoPlay: !voiceConfig.autoPlay });
  };

  const toggleStreamingMode = () => {
    updateVoiceConfig({ streamingMode: !voiceConfig.streamingMode });
  };

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateVoiceConfig({ voice: event.target.value });
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateVoiceConfig({ speed: parseFloat(event.target.value) });
  };

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' },
  ];

  return (
    <div className="voice-controls">
      <div className="voice-header">
        <h3>语音设置</h3>
        <p className="voice-tip">在输入框中使用麦克风按钮进行语音输入</p>
      </div>

      <div className="voice-settings">
        <div className="setting-group">
          <label htmlFor="voice-select">语音类型:</label>
          <select
            id="voice-select"
            value={voiceConfig.voice}
            onChange={handleVoiceChange}
            className="voice-select"
          >
            {voiceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <label htmlFor="speed-range">语音速度: {voiceConfig.speed}x</label>
          <input
            id="speed-range"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={voiceConfig.speed}
            onChange={handleSpeedChange}
            className="speed-slider"
          />
        </div>

        <div className="setting-toggles">
          <button
            className={`setting-toggle ${voiceConfig.autoPlay ? 'active' : ''}`}
            onClick={toggleAutoPlay}
            title="自动播放AI回复"
          >
            {voiceConfig.autoPlay ? <FiVolume2 /> : <FiVolumeX />}
            <span>自动播放</span>
          </button>

          <button
            className={`setting-toggle ${voiceConfig.streamingMode ? 'active' : ''}`}
            onClick={toggleStreamingMode}
            title="流式语音模式"
          >
            <FiSettings />
            <span>流式模式</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceControls; 