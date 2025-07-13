# ChaGPT-API-Call

A lightweight Python project demonstrating multimodal AI interactions with OpenAI APIs. Features text chat, image understanding, and image generation through both CLI and web interfaces.

## Features
- **Multimodal Support**: Text chat, image analysis with GPT-4 Vision, and image generation with DALL-E 3
- **Model Selection**: Choose between GPT-4o, GPT-4.1, GPT-4o Mini, and GPT-3.5 Turbo models
- **Smart Intent Detection**: Automatically determines whether to use text, vision, or image generation models
- **Modern Web Interface**: Beautiful React-based chat UI with drag-and-drop image upload and real-time streaming
- **Context Management**: Auto-removes old messages when token limits are exceeded
- **CLI Tool**: Simple terminal interface for quick testing
- **Speech Support**: Voice recognition via Whisper and text-to-speech playback
- **Voice Mode**: Dedicated speech interface with automatic detection, live transcription and spoken replies
- **Customizable UI**: Multiple background themes, font sizes, and layout options

## Installation

### Requirements
- Python 3.8 or higher (Python 3.11+ supported)
- OpenAI API key
- Node.js 16+ (for frontend development)

### Setup
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   
2. Configure your OpenAI API key:
   ```bash
   # Copy the environment template
   cp env.example .env
   
   # Edit .env and add your OpenAI API key
   echo "OPENAI_API_KEY=your-actual-api-key-here" > .env
   ```

3. (Optional) For frontend development:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

## Usage

### Web Interface (Recommended)
Start the Flask server:
```bash
python manager.py
```
Open [http://127.0.0.1:9200/](http://127.0.0.1:9200/) in your browser.

**Features:**
- **Model Selection**: Choose from available models (GPT-4o, GPT-4.1, GPT-4o Mini, GPT-3.5 Turbo) via the dropdown in the chat header
- **Text Conversations**: Chat with selected AI model with streaming responses
- **Image Analysis**: Upload images for analysis (drag & drop or click to upload)
- **Image Generation**: Request image generation (e.g., "generate an image of a sunset")
- **Voice Interaction**: 
  - Voice input via microphone button
  - Automatic text-to-speech for AI responses
  - Adjustable voice settings (voice type, speed, auto-play)
- **Customizable Interface**:
  - Multiple background themes (gradients, solid colors, images)
  - Adjustable font sizes and spacing
  - Collapsible sidebar for better mobile experience

![Web UI](https://github.com/user-attachments/assets/a60655c7-3e67-4d4c-ad8f-d1d797c2576b)

### Supported Models
- **GPT-4o**: Most capable model, best for complex tasks (Vision support, 4k tokens)
- **GPT-4.1**: Latest GPT-4 model with enhanced capabilities (Vision support, 8k tokens)
- **GPT-4o Mini**: Faster and more affordable (Vision support, 4k tokens)
- **GPT-3.5 Turbo**: Good balance of speed and capability (4k tokens)

### Multimodal Features

**Image Upload & Analysis:**

![Image](https://github.com/user-attachments/assets/57d5f86f-a90a-4383-921f-be69b1111033)

**Image Generation:**

![Image](https://github.com/user-attachments/assets/fbc05f43-2ae4-4658-a00a-03094a90453c)

**Speech Interaction:**

![Image](https://github.com/user-attachments/assets/db2e6abd-532d-4f22-83cf-efa73a73b747)

### Terminal
For simple text-only conversations:
```bash
python test.py
```
Type `clear` to reset the conversation context.

![Terminal demo](https://user-images.githubusercontent.com/17317538/233408407-f798960d-cde1-4f8f-af5a-98edbe7a5dd8.png)

## How It Works
- **Smart Routing**: Automatically detects user intent and routes to appropriate models
- **Model Selection**: Frontend allows real-time switching between different AI models
- **Context Management**: Maintains conversation history and automatically prunes when approaching token limits
- **Image Processing**: Compresses large images automatically for optimal API usage
- **Streaming**: Real-time response display for better user experience
- **Intent Detection**: Separate model for analyzing user requests vs. main conversation model

## Configuration
Adjust model parameters and context settings in `config/chatgpt_config.py`:
- Default model selection
- Context management thresholds
- Temperature and other generation parameters
- Vision and DALL-E model configurations

## Architecture
- **Frontend**: React + TypeScript + Vite for modern web interface
- **Backend**: Flask API with streaming support
- **Model Management**: Separate handling for chat, vision, and image generation models
- **Context System**: Intelligent token management and conversation history

## Examples
- **Text Chat**: "Explain quantum computing" (select GPT-4o for detailed explanation)
- **Image Analysis**: Upload a photo + "What's in this image?" (automatically uses vision model)
- **Image Generation**: "Create a futuristic city at sunset" (automatically uses DALL-E 3)
- **Mixed Mode**: Upload chart + "Analyze this data and create a summary visualization"
- **Model Comparison**: Ask the same question with different models to compare responses

## Development
For frontend development:
```bash
cd frontend
npm run dev  # Development server
npm run build  # Production build
```

For backend development, the Flask server supports hot reloading in debug mode.
