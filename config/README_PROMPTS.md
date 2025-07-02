# Prompt Configuration Guide

## 📋 Overview

The ChatGPT API Call system uses a centralized prompt management system that allows you to easily customize AI behavior without modifying code. The system consists of:

- **`config/prompt_templates.py`**: Contains all prompt templates used by the system
- **`config/prompt_config.yaml`**: Contains configuration settings and overrides
- **`tools/prompt_manager.py`**: Manages and provides access to all prompts

## 🔧 Configuration Structure

### Intent Detection Settings
```yaml
intent_detection:
  confidence_threshold: 0.8    # Confidence threshold for intent detection
  fallback_to_text: true      # Fallback to text conversation if detection fails
  debug_logging: true         # Enable debug logging for intent detection
```

### System Prompts
```yaml
system_prompts:
  default_assistant: |
    You are a helpful AI assistant. Provide clear, accurate, and useful responses to user questions.
    Be concise but comprehensive in your answers.
  
  image_analysis: |
    You are an AI assistant specialized in image analysis. 
    Describe what you see in images with detail and accuracy.
  
  code_assistant: |
    You are a programming assistant. Help users with coding questions, debugging, and best practices.
```

### Error Response Templates
```yaml
error_responses:
  api_error: "I'm sorry, but I'm experiencing technical difficulties. Please try again in a moment."
  rate_limit: "I'm currently experiencing high demand. Please wait a moment and try again."
  invalid_input: "I didn't quite understand your request. Could you please rephrase it?"
```

## 📝 Prompt Template File Structure

The `config/prompt_templates.py` file contains the `PromptTemplates` class with all system prompts organized into categories:

### Template Categories
- **Intent Detection**: LLM-based intent classification prompts
- **System Prompts**: Role-based AI assistant prompts
- **Vision Prompts**: Image analysis and understanding prompts
- **DALL-E Enhancement**: Image generation prompt improvement templates
- **Error Responses**: Standardized error messages
- **Voice Interaction**: Voice mode related prompts
- **Help Prompts**: User guidance and instruction prompts
- **Domain Prompts**: Specialized domain-specific prompts
- **Conversation Flow**: Conversation starters and enders

## 🚀 How to Customize

### 1. Modify Prompt Templates
Edit prompts directly in `config/prompt_templates.py` → `PromptTemplates` class. For example, to change intent detection:

```python
INTENT_DETECTION_TEMPLATE = """Your custom intent detection prompt here..."""
```

### 2. Add New System Prompts
Add new prompt types directly to the `SYSTEM_PROMPTS` dictionary in `config/prompt_templates.py`:
```python
SYSTEM_PROMPTS = {
    # ... existing prompts ...
    'creative_writer': """You are a creative writing assistant. Help users craft engaging stories, poems, and creative content.
    Focus on vivid descriptions and compelling narratives.""",
    
    'your_custom_prompt': """Your custom system prompt here..."""
}
```

### 3. Customize Error Messages
Modify error messages to match your application's tone:
```yaml
error_responses:
  api_error: "Oops! Something went wrong. Let's try that again! 🔄"
  rate_limit: "I'm getting lots of requests right now. Please wait a moment! ⏰"
```

### 4. Adjust Model Settings
Configure default settings for different AI models:
```yaml
dalle_settings:
  default_size: "1024x1024"
  default_quality: "hd"      # Change to 'hd' for higher quality
  prompt_enhancement: true
  safety_filter: true

tts_settings:
  default_voice: "nova"      # Change default voice
  speed: 1.2                 # Adjust speaking speed
```

## 🔄 Reloading Configuration

The system automatically loads configuration on startup. To reload configuration without restarting:

```python
# In your code
prompt_manager.reload_config()
```

## 📝 Best Practices

### 1. Intent Detection Prompts
- Be specific about what constitutes image generation
- Include clear examples of both positive and negative cases
- Use consistent formatting for better AI understanding

### 2. System Prompts
- Keep prompts concise but informative
- Define the AI's role and behavior clearly
- Include specific instructions for response format

### 3. Error Messages
- Keep them user-friendly and helpful
- Provide clear next steps when possible
- Maintain consistent tone across all messages

### 4. Testing Changes
- Test prompt changes with various inputs
- Monitor system logs for unexpected behavior
- Keep backups of working configurations

## 🛠️ Advanced Usage

### Programmatic Access
```python
# Get specific configuration values
voice = prompt_manager.get_config_value('tts_settings.default_voice', 'alloy')
size = prompt_manager.get_config_value('dalle_settings.default_size', '1024x1024')

# Get full settings sections
tts_settings = prompt_manager.get_tts_settings()
dalle_settings = prompt_manager.get_dalle_settings()
```

### Dynamic Prompt Updates
```python
# Future feature: Update prompts at runtime
prompt_manager.update_prompt_template('intent_detection', new_prompt)
```

## 🐛 Troubleshooting

### Configuration Not Loading
- Check YAML syntax validity
- Ensure file permissions are correct
- Verify file path is accessible

### Unexpected AI Behavior
- Review prompt templates for clarity
- Check debug logs for intent detection issues
- Test with simplified prompts first

### Performance Issues
- Consider prompt length impact on API calls
- Monitor API usage and costs
- Optimize prompt efficiency

## 📊 Configuration Examples

### Multilingual Support
```yaml
system_prompts:
  multilingual_assistant: |
    You are a multilingual AI assistant. Respond in the same language the user uses.
    Support English, Chinese, Spanish, French, and other major languages.
```

### Domain-Specific Assistant
```yaml
system_prompts:
  medical_assistant: |
    You are a medical information assistant. Provide accurate medical information while always
    reminding users to consult healthcare professionals for medical advice.
```

### Creative Assistant
```yaml
system_prompts:
  creative_assistant: |
    You are a creative AI assistant. Help users with creative projects including writing,
    brainstorming, and artistic endeavors. Be imaginative and inspiring.
```

---

For more information, see the main README.md or contact the development team. 