from config.chatgpt_config import config_dict
from src.openai_request import OpenAI_Request

from tools.cfg_wrapper import load_config
from tools.context import ContextHandler
from tools.tokennizer import Tokennizer
from tools.prompt_manager import PromptManager

import time
import json
import requests
import base64

class dialogue_api_handler(object):

    def __init__(self,context_max=3200):
        super().__init__()

        # load config
        config = load_config(config_dict)
        keys = config.Acess_config.authorization
        model_name = config.Model_config.model_name
        request_address = config.Model_config.request_address
        vision_model_name = config.Model_config.vision_model_name
        dalle_model_name = config.Model_config.dalle_model_name
        dalle_request_address = config.Model_config.dalle_request_address

        # load context
        context_manage_config = config.Context_manage_config
        del_config = context_manage_config.del_config
        max_context = context_manage_config.max_context
        self.context_handler = ContextHandler(max_context=max_context, context_del_config=del_config)
        self.context_max = context_max

        # load tokenizer
        self.tokenizer = Tokennizer(model_name)

        # load api generate parameter
        generate_config = config.generate_config

        # initialize prompt manager
        self.prompt_manager = PromptManager()

        # initialize
        if generate_config.use_cotomize_param:
            self.requestor = OpenAI_Request(keys, model_name, request_address, generate_config, vision_model_name, dalle_model_name, dalle_request_address)
        else:
            self.requestor = OpenAI_Request(keys, model_name, request_address, None, vision_model_name, dalle_model_name, dalle_request_address)

    def generate_massage(self,user_input):

        if user_input == "clear":
            self.context_handler.clear()
            print('start a new session')
        else:
            inputs_length = self.tokenizer.num_tokens_from_string(user_input)
            self.context_handler.append_cur_to_context(user_input,inputs_length)

        st_time = time.time()

        res = self.requestor.post_request(self.context_handler.context)
        ed_time = time.time()

        print(f'post request time cost = {ed_time - st_time}')

        if res.status_code == 200:

            print(res.json())
            response = res.json()['choices'][0]['message']['content']
            # cut \n for show
            response = response.lstrip("\n")

            completion_length = res.json()['usage']['completion_tokens']
            total_length = res.json()['usage']['total_tokens']
            print(f"\nresponse : {response}")

            self.context_handler.append_cur_to_context(response,completion_length,tag=1)
            if total_length > self.context_max:
                self.context_handler.cut_context(total_length,self.tokenizer)

            print(f'append context time cost = {time.time() - ed_time}')

            return response
        else:
            print(res.json())
            return '!!! The api call is abnormal, please check the backend log'
        

    def generate_massage_stream(self, user_input, model=None):
        print(f"Starting generate_massage_stream with input: {user_input}, model: {model}")  # 调试日志
        
        if user_input == "clear":
            self.context_handler.clear()
            yield "Starting a new session"
            return
        
        inputs_length = self.tokenizer.num_tokens_from_string(user_input)
        self.context_handler.append_cur_to_context(user_input, inputs_length)
        
        print("Making API request...")  # 调试日志
        response = self.requestor.post_request_stream(self.context_handler.context, model)
        print(f"API response status: {response.status_code}")  # 调试日志
        
        full_response = ""
        
        if response.status_code == 200:
            try:
                for line in response.iter_lines():
                    if not line:
                        continue
                        
                    line = line.decode('utf-8')
                    print(f"Raw line: {line}")  # 调试日志
                    
                    if line.startswith('data: '):
                        line = line[6:]
                        if line.strip() == "[DONE]":
                            print("Received DONE signal")  # 调试日志
                            continue
                            
                        try:
                            json_line = json.loads(line)
                            if len(json_line['choices']) > 0:
                                content = json_line['choices'][0].get('delta', {}).get('content', '')
                                if content:
                                    print(f"Yielding content: {content}")  # 调试日志
                                    full_response += content
                                    yield content
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error: {e} for line: {line}")  # 调试日志
                            continue
                            
            except Exception as e:
                print(f"Error in stream processing: {e}")  # 调试日志
                yield f"Error: {str(e)}"
                
            # 更新上下文
            if full_response:
                print(f"Final full response: {full_response}")  # 调试日志
                completion_length = self.tokenizer.num_tokens_from_string(full_response)
                self.context_handler.append_cur_to_context(full_response, completion_length, tag=1)
                
                total_length = inputs_length + completion_length
                if total_length > self.context_max:
                    self.context_handler.cut_context(total_length, self.tokenizer)
        else:
            print(f"API error: {response.text}")  # 调试日志
            yield '!!! The api call is abnormal, please check the backend log'

    def generate_vision_response(self, user_input, image_url):
        """
        Handle image understanding requests
        """
        st_time = time.time()
        
        res = self.requestor.post_vision_request(user_input, image_url)
        ed_time = time.time()
        
        print(f'vision request time cost = {ed_time - st_time}')
        
        if res.status_code == 200:
            response_data = res.json()
            response = response_data['choices'][0]['message']['content']
            response = response.lstrip("\n")
            
            print(f"\nvision response : {response}")
            return response
        else:
            print(res.json())
            return '!!! The vision api call is abnormal, please check the backend log'

    def generate_vision_response_stream(self, user_input, image_url):
        """
        Handle streaming image understanding requests
        """
        print(f"Starting vision stream with input: {user_input[:50]}..., image URL length: {len(image_url) if image_url else 0}")
        
        try:
            response = self.requestor.post_vision_request_stream(user_input, image_url)
            print(f"Vision API response status: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"Vision API error response: {error_text}")
                yield f"Vision API call failed: {response.status_code} - {error_text}"
                return
        except Exception as e:
            print(f"Vision API request failed: {e}")
            yield f"Vision request failed: {str(e)}"
            return
        
        full_response = ""
        
        if response.status_code == 200:
            try:
                for line in response.iter_lines():
                    if not line:
                        continue
                        
                    line = line.decode('utf-8')
                    print(f"Vision raw line: {line}")
                    
                    if line.startswith('data: '):
                        line = line[6:]
                        if line.strip() == "[DONE]":
                            print("Vision received DONE signal")
                            continue
                            
                        try:
                            json_line = json.loads(line)
                            if len(json_line['choices']) > 0:
                                content = json_line['choices'][0].get('delta', {}).get('content', '')
                                if content:
                                    print(f"Vision yielding content: {content}")
                                    full_response += content
                                    yield content
                        except json.JSONDecodeError as e:
                            print(f"Vision JSON decode error: {e} for line: {line}")
                            continue
                            
            except Exception as e:
                print(f"Error in vision stream processing: {e}")
                yield f"Error: {str(e)}"
        else:
            print(f"Vision API error: {response.text}")
            yield '!!! The vision api call is abnormal, please check the backend log'

    def generate_dalle_image(self, prompt, size="1024x1024", quality="standard"):
        """
        Handle image generation requests
        """
        st_time = time.time()
        
        res = self.requestor.post_dalle_request(prompt, size, quality)
        ed_time = time.time()
        
        print(f'dalle request time cost = {ed_time - st_time}')
        
        if res.status_code == 200:
            response_data = res.json()
            image_url = response_data['data'][0]['url']
            
            print(f"\ndalle generated image url: {image_url}")
            return {
                'success': True,
                'image_url': image_url,
                'revised_prompt': response_data['data'][0].get('revised_prompt', prompt)
            }
        else:
            print(res.json())
            return {
                'success': False,
                'error': '!!! The dalle api call is abnormal, please check the backend log'
            }

    def generate_dalle_image_stream(self, prompt):
        """
        Generate DALL-E image with streaming-like response
        """
        print(f"Generating DALL-E image with prompt: {prompt}")
        
        try:
            # 首先生成图像
            result = self.generate_dalle_image(prompt)
            
            if result['success']:
                # 流式返回结果
                yield "I've generated an image for you."
                yield f"[IMAGE:{result['image_url']}]"  # Special marker for frontend recognition
            else:
                yield f"Image generation failed: {result['error']}"
                
        except Exception as e:
            print(f"Error in generate_dalle_image_stream: {e}")
            yield f"Error generating image: {str(e)}"

    def transcribe_audio(self, file_obj, language=None):
        """Convert speech audio to text using Whisper"""
        max_retries = 2
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                res = self.requestor.post_whisper_transcription(file_obj, language=language)
                
                if res.status_code == 200:
                    result = res.json()
                    text = result.get('text', '').strip()
                    print(f"ASR success - Text: {text[:100]}{'...' if len(text) > 100 else ''}")
                    return text
                else:
                    print(f"ASR API error - Status: {res.status_code}, Response: {res.text}")
                    if res.status_code == 429:  # Rate limit
                        time.sleep(1)
                        retry_count += 1
                        continue
                    return None
                    
            except Exception as e:
                print(f"ASR exception attempt {retry_count + 1}: {e}")
                retry_count += 1
                if retry_count < max_retries:
                    time.sleep(1)
                    
        return None

    def text_to_speech(self, text, voice="alloy"):
        """Convert text to speech using OpenAI TTS (non-streaming)"""
        max_retries = 2
        retry_count = 0
        
        # Text preprocessing
        text = text.strip()
        if not text:
            return None
            
        # Handle long text
        if len(text) > 4000:
            text = text[:4000] + "..."
            print(f"TTS text truncated to 4000 characters")
        
        while retry_count < max_retries:
            try:
                res = self.requestor.post_tts_request(text, voice)
                
                if res.status_code == 200:
                    audio_data = res.content
                    if len(audio_data) > 1000:  # Check audio data validity
                        print(f"TTS success - Audio size: {len(audio_data)} bytes, Voice: {voice}")
                        return audio_data
                    else:
                        print(f"TTS returned invalid audio data: {len(audio_data)} bytes")
                        return None
                else:
                    print(f"TTS API error - Status: {res.status_code}, Response: {res.text}")
                    if res.status_code == 429:  # Rate limit
                        time.sleep(1)
                        retry_count += 1
                        continue
                    return None
                    
            except Exception as e:
                print(f"TTS exception attempt {retry_count + 1}: {e}")
                retry_count += 1
                if retry_count < max_retries:
                    time.sleep(1)
                    
        return None

    def text_to_speech_stream(self, text, voice="alloy"):
        """Convert text to speech using OpenAI TTS with streaming"""
        
        # Text preprocessing
        text = text.strip()
        if not text:
            return
            
        # Handle long text
        if len(text) > 4000:
            text = text[:4000] + "..."
            print(f"TTS streaming text truncated to 4000 characters")
        
        # Use requests directly for streaming
        url = "https://api.openai.com/v1/audio/speech"
        headers = self.requestor.headers.copy()  # Use existing headers with API key
        
        data = {
            "model": "tts-1",  # Use tts-1 for better streaming performance
            "input": text,
            "voice": voice,
            "response_format": "mp3",  # MP3 works better for streaming
            "speed": 1.0
        }
        
        try:
            print(f"Starting TTS streaming for text: {text[:50]}...")
            
            with requests.post(url, headers=headers, json=data, stream=True) as response:
                if response.status_code == 200:
                    print(f"TTS streaming started successfully")
                    
                    # Stream audio chunks
                    for chunk in response.iter_content(chunk_size=4096):
                        if chunk:
                            # Convert chunk to base64 for frontend
                            audio_b64 = base64.b64encode(chunk).decode('utf-8')
                            yield {
                                'type': 'audio_chunk',
                                'data': audio_b64,
                                'format': 'mp3'
                            }
                    
                    print(f"TTS streaming completed")
                    yield {
                        'type': 'audio_end',
                        'message': 'Audio streaming completed'
                    }
                else:
                    print(f"TTS streaming failed - Status: {response.status_code}")
                    yield {
                        'type': 'error',
                        'message': f'TTS API error: {response.status_code}'
                    }
                    
        except Exception as e:
            print(f"TTS streaming exception: {e}")
            yield {
                'type': 'error',
                'message': f'TTS streaming failed: {str(e)}'
            }

    def detect_intent_and_generate(self, user_input, image_url=None, model=None):
        """
        Detect user intent and route to appropriate generation method
        """
        print(f"Detecting intent for input: {user_input[:50]}..., model: {model}")
        
        try:
            # 检查是否明确请求图像生成
            if any(keyword in user_input.lower() for keyword in ['generate image', 'create image', 'draw', 'paint', 'generate a picture', 'create a picture']):
                print("Direct image generation request detected")
                for chunk in self.generate_dalle_image_stream(user_input):
                    yield chunk
                return
            
            # 如果用户上传了图像，使用视觉模型
            if image_url:
                print("Image provided, using vision model")
                for chunk in self.generate_vision_response_stream(user_input, image_url):
                    yield chunk
                return
            
            # 使用LLM检测意图
            is_image_request = self._detect_intent_with_llm(user_input)
            
            if is_image_request:
                print("Image generation intent detected by LLM")
                for chunk in self.generate_dalle_image_stream(user_input):
                    yield chunk
            else:
                print("Text conversation intent detected")
                for chunk in self.generate_massage_stream(user_input, model):
                    yield chunk
                    
        except Exception as e:
            print(f"Error in detect_intent_and_generate: {e}")
            yield f"Error: {str(e)}"

    def _detect_intent_with_llm(self, user_input):
        """
        Use LLM to detect if the user input is requesting image generation
        """
        try:
            # Get intent detection prompt from prompt manager
            intent_detection_prompt = self.prompt_manager.get_intent_detection_prompt(user_input)
        
            # Create a simple context for intent detection
            intent_context = [{"role": "user", "content": intent_detection_prompt}]
            
            # Use the existing requestor to make the API call
            response = self.requestor.post_request(intent_context)
            
            if response.status_code == 200:
                result = response.json()['choices'][0]['message']['content'].strip().upper()
                print(f"Intent detection response: {result}")
                
                # Parse the response
                if "YES" in result:
                    return True
                elif "NO" in result:
                    return False
                else:
                    print(f"Unexpected intent detection response: {result}, defaulting to NO")
                    return False
            else:
                print(f"Intent detection API failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Intent detection error: {e}")
            return False





