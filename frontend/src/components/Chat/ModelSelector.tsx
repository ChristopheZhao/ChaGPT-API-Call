import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCpu, FiEye, FiZap } from 'react-icons/fi';
import { useChatStore } from '../../stores/chatStore';
import type { ModelConfig } from '../../types';

const ModelSelector: React.FC = () => {
  const { models, currentModel, setCurrentModel } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModelConfig = models.find(m => m.name === currentModel);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (modelName: string) => {
    setCurrentModel(modelName);
    setIsOpen(false);
  };

  const getModelIcon = (model?: ModelConfig) => {
    if (!model) {
      return <FiCpu className="model-icon" />;
    }
    
    if (model.name.includes('gpt-4')) {
      return <FiCpu className="model-icon" />;
    } else if (model.supportsVision) {
      return <FiEye className="model-icon" />;
    } else {
      return <FiZap className="model-icon" />;
    }
  };

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button
        className="model-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Select model"
      >
        {getModelIcon(currentModelConfig)}
        <span className="model-name">{currentModelConfig?.displayName || 'Select Model'}</span>
        <FiChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div className="dropdown-header">
            <h4>Select Model</h4>
            <p>Choose the AI model for your conversation</p>
          </div>
          
          <div className="model-list">
            {models.map((model) => (
              <button
                key={model.name}
                className={`model-option ${model.name === currentModel ? 'active' : ''}`}
                onClick={() => handleModelSelect(model.name)}
              >
                <div className="model-option-header">
                  {getModelIcon(model)}
                  <div className="model-option-info">
                    <div className="model-option-name">{model.displayName}</div>
                    <div className="model-option-description">
                      {model.name.includes('gpt-4') ? 'Most capable model' : 
                       model.name.includes('gpt-3.5') ? 'Fast and efficient' : 
                       'AI model'}
                    </div>
                  </div>
                </div>
                
                <div className="model-option-features">
                  {model.supportsVision && (
                    <span className="feature-badge vision">Vision</span>
                  )}
                  <span className="feature-badge streaming">Streaming</span>
                  <span className="feature-badge tokens">{Math.floor(model.maxTokens / 1000)}k tokens</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 