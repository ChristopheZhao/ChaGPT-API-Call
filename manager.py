from flask import Flask, Response, stream_with_context, request, send_from_directory
from flask_cors import CORS
import json
import os
from web_api.dialogue_api import dialogue_api_handler

app = Flask(__name__)
CORS(app)

dialogue_api_hl = dialogue_api_handler()

@app.route("/request_openai", methods=['POST'])
def request_openai():
    try:
        user_request_input = request.json.get('user_input')
        model = request.json.get('model', 'gpt-4o')  # 默认使用gpt-4o
        print(f"Received request with input: {user_request_input}, model: {model}")

        def generate():
            try:
                for chunk in dialogue_api_hl.generate_massage_stream(user_request_input, model):
                    chunk_data = json.dumps({
                        'code': 0,
                        'message': 'success',
                        'chunk': chunk
                    })
                    yield f"data: {chunk_data}\n\n"
            except Exception as e:
                error_data = json.dumps({
                    'code': 1,
                    'message': 'call failed',
                    'chunk': str(e)
                })
                yield f"data: {error_data}\n\n"
            yield "data: [DONE]\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        return {'code': 1, 'message': str(e)}, 500

@app.route("/speech_to_text", methods=['POST'])
def speech_to_text():
    try:
        if 'audio' not in request.files:
            return {'code': 1, 'message': 'Missing audio file'}, 400

        file_obj = request.files['audio']
        language = request.form.get('language')  # 可选的语言参数
        
        # 检查文件大小
        if file_obj.content_length and file_obj.content_length > 25 * 1024 * 1024:  # 25MB限制
            return {'code': 1, 'message': 'Audio file too large (max 25MB)'}, 400
        
        print(f"ASR request - File: {file_obj.filename}, Size: {file_obj.content_length}, Language: {language}")
        
        text = dialogue_api_hl.transcribe_audio(file_obj, language)
        if text is None:
            return {'code': 1, 'message': 'Speech recognition failed'}, 500
            
        # 过滤掉过短的结果
        if len(text.strip()) < 2:
            return {'code': 1, 'message': 'No valid speech detected'}, 400
            
        return {'code': 0, 'text': text}
    except Exception as e:
        print(f"ASR error: {e}")
        return {'code': 1, 'message': str(e)}, 500

@app.route("/text_to_speech", methods=['POST'])
def text_to_speech():
    try:
        text = request.json.get('text')
        voice = request.json.get('voice', 'alloy')  # 默认使用alloy语音
        
        if not text:
            return {'code': 1, 'message': 'Missing text'}, 400
        
        # 文本长度限制
        if len(text) > 4000:
            return {'code': 1, 'message': 'Text too long (max 4000 characters)'}, 400
            
        print(f"TTS request - Text length: {len(text)}, Voice: {voice}")
        
        audio_data = dialogue_api_hl.text_to_speech(text, voice)
        if audio_data is None:
            return {'code': 1, 'message': 'TTS generation failed'}, 500
            
        return Response(
            audio_data,
            mimetype='audio/mpeg',
            headers={
                'Content-Disposition': 'attachment; filename="speech.mp3"',
                'Content-Length': str(len(audio_data))
            }
        )
    except Exception as e:
        print(f"TTS error: {e}")
        return {'code': 1, 'message': str(e)}, 500

@app.route("/text_to_speech_stream", methods=['POST'])
def text_to_speech_stream():
    """
    Streaming TTS endpoint for real-time audio generation
    """
    try:
        text = request.json.get('text')
        voice = request.json.get('voice', 'alloy')
        
        if not text:
            return {'code': 1, 'message': 'Missing text'}, 400
        
        # Text length limit
        if len(text) > 4000:
            return {'code': 1, 'message': 'Text too long (max 4000 characters)'}, 400
            
        print(f"TTS streaming request - Text length: {len(text)}, Voice: {voice}")
        
        def generate():
            try:
                for chunk_data in dialogue_api_hl.text_to_speech_stream(text, voice):
                    response_data = json.dumps({
                        'code': 0,
                        'message': 'success',
                        **chunk_data
                    })
                    yield f"data: {response_data}\n\n"
            except Exception as e:
                error_data = json.dumps({
                    'code': 1,
                    'message': 'streaming TTS failed',
                    'type': 'error',
                    'error': str(e)
                })
                yield f"data: {error_data}\n\n"
            yield "data: [DONE]\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        print(f"TTS streaming error: {e}")
        return {'code': 1, 'message': str(e)}, 500

@app.route("/request_smart", methods=['POST'])
def request_smart():
    """
    Smart multimodal API endpoint - Automatically detect intent and select appropriate model
    """
    try:
        user_input = request.json.get('user_input')
        image_url = request.json.get('image_url')
        model = request.json.get('model', 'gpt-4o')  # 默认使用gpt-4o
        
        if not user_input:
            return {'code': 1, 'message': 'Missing user_input'}, 400

        print(f"Received smart request with input: {user_input}, image: {image_url}, model: {model}")

        def generate():
            try:
                for chunk in dialogue_api_hl.detect_intent_and_generate(user_input, image_url, model):
                    chunk_data = json.dumps({
                        'code': 0,
                        'message': 'success',
                        'chunk': chunk
                    })
                    yield f"data: {chunk_data}\n\n"
            except Exception as e:
                error_data = json.dumps({
                    'code': 1,
                    'message': 'smart call failed',
                    'chunk': str(e)
                })
                yield f"data: {error_data}\n\n"
            yield "data: [DONE]\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        return {'code': 1, 'message': str(e)}, 500

@app.route("/static/backgrounds/<filename>")
def serve_background(filename):
    """Serve background images"""
    background_path = os.path.join(app.root_path, 'static', 'backgrounds')
    print(f"Serving background: {filename} from {background_path}")
    
    # 检查文件是否存在
    file_path = os.path.join(background_path, filename)
    if not os.path.exists(file_path):
        print(f"Background file not found: {file_path}")
        return "Background image not found", 404
    
    print(f"Background file found: {file_path}")
    return send_from_directory(background_path, filename)

@app.route("/test-backgrounds")
def test_backgrounds():
    """Test endpoint to list available background images"""
    background_path = os.path.join(app.root_path, 'static', 'backgrounds')
    try:
        files = os.listdir(background_path) if os.path.exists(background_path) else []
        return {
            'background_path': background_path,
            'files': files,
            'exists': os.path.exists(background_path)
        }
    except Exception as e:
        return {'error': str(e)}

@app.route("/")
def index():
    return {
        'name': 'ChatFlow API',
        'version': '1.0.0',
        'description': 'Modern AI Chat API with multimodal support',
        'endpoints': {
            'POST /request_openai': 'Standard OpenAI chat completion',
            'POST /request_smart': 'Smart multimodal requests with auto intent detection',
            'POST /speech_to_text': 'Speech recognition via Whisper',
            'POST /text_to_speech': 'Text-to-speech generation',
            'POST /text_to_speech_stream': 'Streaming text-to-speech'
        },
        'frontend': {
            'development': 'cd frontend && npm run dev',
            'production': 'cd frontend && npm run build && npm run preview'
        }
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9200, debug=True)