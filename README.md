# ChaGPT-API-Call

A lightweight Python project demonstrating multimodal AI interactions with OpenAI APIs. Features text chat, image understanding, and image generation through both CLI and web interfaces.

## Features
- **Multimodal Support**: Text chat, image analysis with GPT-4 Vision, and image generation with DALL-E 3
- **Smart Intent Detection**: Automatically determines whether to use text, vision, or image generation models
- **Web Interface**: Modern chat UI with drag-and-drop image upload and real-time streaming
- **Context Management**: Auto-removes old messages when token limits are exceeded
- **CLI Tool**: Simple terminal interface for quick testing
- **Speech Support**: Voice recognition via Whisper and text-to-speech playback
- **Voice Mode**: Toggleable voice chat with waveform display and auto spoken replies

## Installation

### Requirements
- Python 3.8 or higher (Python 3.11+ supported)
- OpenAI API key

### Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   
2. Add your OpenAI API key to `config/chatgpt_config.py`:
   ```python
   authorization = "your-openai-api-key-here"
   ```

## Usage

### Web Interface (Recommended)
Start the Flask server:
```bash
python manager.py
```
Open [http://127.0.0.1:9200/](http://127.0.0.1:9200/) in your browser.

**Features:**
- Text conversations with GPT models
- Upload images for analysis (drag & drop or click to upload)
- Request image generation (e.g., "generate an image of a sunset")
- Real-time streaming responses
- Voice input via microphone and spoken replies (voice mode with waveform display)
- Enable the "Voice Mode" switch in the chat header to activate the microphone button


![Web UI](https://github.com/user-attachments/assets/a60655c7-3e67-4d4c-ad8f-d1d797c2576b)

### Multimodal Features

**Image Upload & Analysis:**

![Image](https://github.com/user-attachments/assets/b6016a83-79a0-4dce-95f2-7ee9d2110180)

**Image Generation:**

![Image](https://github.com/user-attachments/assets/38a3615e-54f6-4c6d-8a21-2c5f2bf35df2)

### Terminal
For simple text-only conversations:
```bash
python test.py
```
Type `clear` to reset the conversation context.

![Terminal demo](https://user-images.githubusercontent.com/17317538/233408407-f798960d-cde1-4f8f-af5a-98edbe7a5dd8.png)

## How It Works
- **Smart Routing**: Automatically detects user intent and routes to appropriate models
- **Context Management**: Maintains conversation history and automatically prunes when approaching token limits
- **Image Processing**: Compresses large images automatically for optimal API usage
- **Streaming**: Real-time response display for better user experience

## Configuration
Adjust model parameters and context settings in `config/chatgpt_config.py`:
- Model selection (GPT-3.5, GPT-4, GPT-4 Vision, DALL-E 3)
- Context management thresholds
- Temperature and other generation parameters

## Examples
- **Text Chat**: "Explain quantum computing"
- **Image Analysis**: Upload a photo + "What's in this image?"
- **Image Generation**: "Create a futuristic city at sunset"
- **Mixed Mode**: Upload chart + "Analyze this data and create a summary visualization"
