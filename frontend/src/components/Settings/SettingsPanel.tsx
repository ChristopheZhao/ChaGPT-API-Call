import React, { useState, useEffect } from 'react';
import { FiX, FiVolume2, FiVolumeX, FiSettings, FiImage, FiType, FiEye, FiMonitor, FiCheck, FiRotateCcw } from 'react-icons/fi';
import { useSettingsStore } from '../../stores/settingsStore';
import type { UIConfig, VoiceConfig } from '../../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateVoiceConfig, updateUIConfig } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'voice' | 'general'>('appearance');
  
  // 保存原始设置作为备份
  const [originalUISettings, setOriginalUISettings] = useState<UIConfig | null>(null);
  const [originalVoiceSettings, setOriginalVoiceSettings] = useState<VoiceConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 当面板打开时，保存原始设置
  useEffect(() => {
    if (isOpen) {
      const defaultUI = {
        background: 'gradient' as const,
        backgroundImage: '/backgrounds/anime_sakura.jpg',
        fontSize: 'medium' as const,
        density: 'comfortable' as const,
        showTimestamp: true,
        enableAnimations: true,
        compactMode: false,
      };
      setOriginalUISettings(settings.ui || defaultUI);
      setOriginalVoiceSettings(settings.voice);
      setHasChanges(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const currentUISettings = settings.ui || {
    background: 'gradient' as const,
    backgroundImage: '/backgrounds/anime_sakura.jpg',
    fontSize: 'medium' as const,
    density: 'comfortable' as const,
    showTimestamp: true,
    enableAnimations: true,
    compactMode: false,
  };

  const currentVoiceSettings = settings.voice;

  const backgroundOptions = [
    { value: 'gradient', label: 'Classic Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { value: 'gradient-purple', label: 'Purple Gradient', preview: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)' },
    { value: 'gradient-pink', label: 'Pink Gradient', preview: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    { value: 'gradient-ocean', label: 'Ocean Gradient', preview: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)' },
    { value: 'gradient-sunset', label: 'Sunset Gradient', preview: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
    { value: 'gradient-forest', label: 'Forest Gradient', preview: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { value: 'solid', label: 'Light Background', preview: '#f8fafc' },
    { value: 'dark', label: 'Dark Background', preview: '#1e293b' },
    { value: 'image', label: 'Image Background', preview: 'url(/backgrounds/anime_sakura.jpg)' },
    { value: 'none', label: 'White Background', preview: '#ffffff' },
  ];

  const backgroundImages = [
    { value: '/backgrounds/anime_sakura.jpg', label: 'Sakura' },
    { value: '/backgrounds/anime_beach.jpg', label: 'Beach' },
    { value: '/backgrounds/anime_starry.jpg', label: 'Starry' },
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  const densityOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' },
  ];

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' },
  ];

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (settings.voice) {
      updateVoiceConfig({ ...settings.voice, voice: event.target.value });
      setHasChanges(true);
    }
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (settings.voice) {
      updateVoiceConfig({ ...settings.voice, speed: parseFloat(event.target.value) });
      setHasChanges(true);
    }
  };

  const toggleAutoPlay = () => {
    if (settings.voice) {
      updateVoiceConfig({ ...settings.voice, autoPlay: !settings.voice.autoPlay });
      setHasChanges(true);
    }
  };

  const toggleStreamingMode = () => {
    if (settings.voice) {
      updateVoiceConfig({ ...settings.voice, streamingMode: !settings.voice.streamingMode });
      setHasChanges(true);
    }
  };

  const handleBackgroundChange = (background: string) => {
    if (settings.ui) {
      updateUIConfig({ ...settings.ui, background: background as any });
      setHasChanges(true);
    }
  };

  const handleBackgroundImageChange = (image: string) => {
    if (settings.ui) {
      updateUIConfig({ ...settings.ui, backgroundImage: image });
      setHasChanges(true);
    }
  };

  const handleFontSizeChange = (fontSize: string) => {
    if (settings.ui) {
      updateUIConfig({ ...settings.ui, fontSize: fontSize as any });
      setHasChanges(true);
    }
  };

  const handleDensityChange = (density: string) => {
    if (settings.ui) {
      updateUIConfig({ ...settings.ui, density: density as any });
      setHasChanges(true);
    }
  };

  const toggleTimestamp = () => {
    if (settings.ui) {
      updateUIConfig({ ...settings.ui, showTimestamp: !settings.ui.showTimestamp });
      setHasChanges(true);
    }
  };

  const toggleAnimations = () => {
    if (settings.ui) {
      updateUIConfig({ ...settings.ui, enableAnimations: !settings.ui.enableAnimations });
      setHasChanges(true);
    }
  };

  const toggleCompactMode = () => {
    if (settings.ui) {
      updateUIConfig({ ...settings.ui, compactMode: !settings.ui.compactMode });
      setHasChanges(true);
    }
  };

  const handleConfirm = () => {
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    // 恢复到原始设置
    if (originalUISettings) {
      updateUIConfig(originalUISettings);
    }
    if (originalVoiceSettings) {
      updateVoiceConfig(originalVoiceSettings);
    }
    setHasChanges(false);
    onClose();
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: FiEye },
    { id: 'voice', label: 'Voice', icon: FiVolume2 },
    { id: 'general', label: 'General', icon: FiSettings },
  ];

  return (
    <div className="settings-panel">
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-content">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-body">
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance Settings</h3>
              
              <div className="setting-group">
                <label>Background Style</label>
                <div className="background-options">
                  {backgroundOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`background-option ${currentUISettings.background === option.value ? 'selected' : ''}`}
                      onClick={() => handleBackgroundChange(option.value)}
                    >
                      <div 
                        className="background-preview"
                        style={{ background: option.preview }}
                      />
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentUISettings.background === 'image' && (
                <div className="setting-group">
                  <label>Background Image</label>
                  <div className="image-options">
                    {backgroundImages.map((image) => (
                      <div
                        key={image.value}
                        className={`image-option ${currentUISettings.backgroundImage === image.value ? 'selected' : ''}`}
                        onClick={() => handleBackgroundImageChange(image.value)}
                      >
                        <img src={image.value} alt={image.label} />
                        <span>{image.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="setting-group">
                <label>Font Size</label>
                <div className="option-buttons">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      className={`option-button ${currentUISettings.fontSize === size.value ? 'selected' : ''}`}
                      onClick={() => handleFontSizeChange(size.value)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label>Density</label>
                <div className="option-buttons">
                  {densityOptions.map((density) => (
                    <button
                      key={density.value}
                      className={`option-button ${currentUISettings.density === density.value ? 'selected' : ''}`}
                      onClick={() => handleDensityChange(density.value)}
                    >
                      {density.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-toggles">
                <div className="toggle-item">
                  <label>Show Timestamp</label>
                  <button
                    className={`toggle-button ${currentUISettings.showTimestamp ? 'active' : ''}`}
                    onClick={toggleTimestamp}
                  >
                    <div className="toggle-slider" />
                  </button>
                </div>
                
                <div className="toggle-item">
                  <label>Enable Animations</label>
                  <button
                    className={`toggle-button ${currentUISettings.enableAnimations ? 'active' : ''}`}
                    onClick={toggleAnimations}
                  >
                    <div className="toggle-slider" />
                  </button>
                </div>
                
                <div className="toggle-item">
                  <label>Compact Mode</label>
                  <button
                    className={`toggle-button ${currentUISettings.compactMode ? 'active' : ''}`}
                    onClick={toggleCompactMode}
                  >
                    <div className="toggle-slider" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="settings-section">
              <h3>Voice Settings</h3>
              <p className="section-description">Use the microphone button in the input box for voice input</p>
              
              <div className="setting-group">
                <label htmlFor="voice-select">Voice Type</label>
                <select
                  id="voice-select"
                  value={currentVoiceSettings.voice}
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
                <label htmlFor="speed-range">Voice Speed: {currentVoiceSettings.speed}x</label>
                <input
                  id="speed-range"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={currentVoiceSettings.speed}
                  onChange={handleSpeedChange}
                  className="speed-slider"
                />
              </div>

              <div className="setting-toggles">
                <div className="toggle-item">
                  <label>Auto Play Reply</label>
                  <button
                    className={`toggle-button ${currentVoiceSettings.autoPlay ? 'active' : ''}`}
                    onClick={toggleAutoPlay}
                  >
                    <div className="toggle-slider" />
                  </button>
                </div>
                
                <div className="toggle-item">
                  <label>Streaming Voice Mode</label>
                  <button
                    className={`toggle-button ${currentVoiceSettings.streamingMode ? 'active' : ''}`}
                    onClick={toggleStreamingMode}
                  >
                    <div className="toggle-slider" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              
              <div className="setting-group">
                <label>API Endpoint</label>
                <input
                  type="text"
                  value={settings.apiEndpoint}
                  readOnly
                  className="api-endpoint-input"
                />
              </div>

              <div className="setting-group">
                <label>Version Information</label>
                <div className="version-info">
                  <p>Frontend Version: 1.0.0</p>
                  <p>Build Time: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          {hasChanges && (
            <div className="changes-indicator">
              <span>Settings Modified</span>
            </div>
          )}
          <div className="footer-buttons">
            <button className="cancel-button" onClick={handleCancel}>
              <FiRotateCcw />
              Cancel
            </button>
            <button 
              className="confirm-button"
              onClick={handleConfirm}
            >
              <FiCheck />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 