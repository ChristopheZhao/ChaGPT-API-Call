from flask import Flask, render_template, Response, stream_with_context, request
from flask_cors import CORS
import json
from web_api.dialogue_api import dialogue_api_handler

app = Flask(__name__)
CORS(app)

dialogue_api_hl = dialogue_api_handler()

@app.route("/request_openai", methods=['POST'])
def request_openai():
    try:
        user_request_input = request.json.get('user_input')
        print(f"Received request with input: {user_request_input}")

        def generate():
            try:
                for chunk in dialogue_api_hl.generate_massage_stream(user_request_input):
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

@app.route("/request_smart", methods=['POST'])
def request_smart():
    """
    Smart multimodal API endpoint - Automatically detect intent and select appropriate model
    """
    try:
        user_input = request.json.get('user_input')
        image_url = request.json.get('image_url')
        
        if not user_input:
            return {'code': 1, 'message': 'Missing user_input'}, 400

        print(f"Received smart request with input: {user_input}, image: {image_url}")

        def generate():
            try:
                for chunk in dialogue_api_hl.detect_intent_and_generate(user_input, image_url):
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

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9200, debug=True)