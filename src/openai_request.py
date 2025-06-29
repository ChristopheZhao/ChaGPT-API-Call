import requests
import json

class OpenAI_Request(object):

    def __init__(self,key,model_name,request_address,generate_config=None,vision_model_name=None,dalle_model_name=None,dalle_request_address=None):
        super().__init__()
        self.headers = {"Authorization":f"Bearer {key}","Content-Type": "application/json"}
        self.model__name = model_name
        self.request_address = request_address
        self.generate_config = generate_config
        self.vision_model_name = vision_model_name
        self.dalle_model_name = dalle_model_name
        self.dalle_request_address = dalle_request_address

    def post_request(self,message):

        data = {
            "model": self.model__name,
            "messages":  message
        }

        # add generate parameter of api
        if self.generate_config:
            for k,v in self.generate_config.param_dict.__dict__.items():
                data[k] = v

        data = json.dumps(data)

        response = requests.post(self.request_address, headers=self.headers, data=data)

        return response
    
    def post_request_stream(self, message):
        print("Preparing stream request...")  # Debug log
        
        data = {
            "model": self.model__name,
            "messages": message,
            "stream": True,
        }

        if self.generate_config:
            for k,v in self.generate_config.param_dict.__dict__.items():
                if k != 'stream':
                    data[k] = v
                    
        print(f"Request data: {json.dumps(data)}")  # Debug log
        
        try:
            response = requests.post(
                self.request_address, 
                headers=self.headers, 
                data=json.dumps(data),
                stream=True,
                timeout=30  # Add timeout setting
            )
            print(f"API response status: {response.status_code}")  # Debug log
            return response
        except Exception as e:
            print(f"Request error: {e}")  # Debug log
            raise

    def post_vision_request(self, message, image_url):
        """
        Vision API request - Image understanding
        """
        data = {
            "model": self.vision_model_name or "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": message
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 500
        }

        if self.generate_config and hasattr(self.generate_config, 'param_dict'):
            param_dict = self.generate_config.param_dict if hasattr(self.generate_config.param_dict, '__dict__') else self.generate_config.param_dict
            if hasattr(param_dict, '__dict__'):
                param_items = param_dict.__dict__.items()
            else:
                param_items = param_dict.items()
            
            for k, v in param_items:
                if k not in ['stream']:
                    data[k] = v

        response = requests.post(self.request_address, headers=self.headers, data=json.dumps(data))
        return response

    def post_vision_request_stream(self, message, image_url):
        """
        Vision API streaming request - Image understanding
        """
        print(f"Vision stream request - Message: {message[:50]}..., Image URL length: {len(image_url) if image_url else 0}")
        
        data = {
            "model": self.vision_model_name or "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": message
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 500,
            "stream": True
        }

        if self.generate_config and hasattr(self.generate_config, 'param_dict'):
            param_dict = self.generate_config.param_dict if hasattr(self.generate_config.param_dict, '__dict__') else self.generate_config.param_dict
            if hasattr(param_dict, '__dict__'):
                param_items = param_dict.__dict__.items()
            else:
                param_items = param_dict.items()
            
            for k, v in param_items:
                if k not in ['stream']:
                    data[k] = v

        try:
            response = requests.post(
                self.request_address, 
                headers=self.headers, 
                data=json.dumps(data),
                stream=True,
                timeout=30
            )
            return response
        except Exception as e:
            print(f"Vision request error: {e}")
            raise

    def post_dalle_request(self, prompt, size="1024x1024", quality="standard", n=1):
        """
        DALL-E API request - Image generation
        """
        data = {
            "model": self.dalle_model_name or "dall-e-3",
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "n": n
        }

        response = requests.post(self.dalle_request_address, headers=self.headers, data=json.dumps(data))
        return response

    def post_whisper_transcription(self, file_obj, model="whisper-1", language=None):
        """Whisper API request - Speech to Text"""
        headers = {"Authorization": self.headers.get("Authorization")}
        files = {"file": (file_obj.filename, file_obj.stream, file_obj.mimetype)}
        data = {"model": model}
        if language:
            data["language"] = language

        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers=headers,
            files=files,
            data=data,
        )
        return response

    def post_tts_request(self, text, voice="alloy", model="tts-1"):
        """OpenAI TTS API request - Text to Speech"""
        headers = self.headers.copy()
        headers["Content-Type"] = "application/json"
        data = {
            "model": model,
            "input": text,
            "voice": voice,
            "response_format": "mp3",
        }
        response = requests.post(
            "https://api.openai.com/v1/audio/speech",
            headers=headers,
            data=json.dumps(data),
        )
        return response


if __name__ == '__main__':
    keys = "OpenAI API keys"
    model_name = "gpt-3.5-turbo"
    request_address = "https://api.openai.com/v1/chat/completions"
    requestor = OpenAI_Request(keys,model_name,request_address)

    while 1:
        input_s = input('user input: ')
        res = requestor.post_request(input_s)

        response = res.json()['choices'][0]['message']['content']

        if  response:
            requestor.context_handler.append_cur_to_context(response,tag=1)

        print(f"chatGPT: {response}")

