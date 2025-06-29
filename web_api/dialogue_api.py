from config.chatgpt_config import config_dict
from src.openai_request import OpenAI_Request

from tools.cfg_wrapper import load_config
from tools.context import ContextHandler
from tools.tokennizer import Tokennizer

import time
import json

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
        

    def generate_massage_stream(self, user_input):
        print(f"Starting generate_massage_stream with input: {user_input}")  # 调试日志
        
        if user_input == "clear":
            self.context_handler.clear()
            yield "Starting a new session"
            return
        
        inputs_length = self.tokenizer.num_tokens_from_string(user_input)
        self.context_handler.append_cur_to_context(user_input, inputs_length)
        
        print("Making API request...")  # 调试日志
        response = self.requestor.post_request_stream(self.context_handler.context)
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

    def transcribe_audio(self, file_obj, language=None):
        """Convert speech audio to text using Whisper"""
        res = self.requestor.post_whisper_transcription(file_obj, language=language)
        if res.status_code == 200:
            return res.json().get('text', '')
        else:
            print(res.text)
            return None

    def text_to_speech(self, text, voice="alloy"):
        """Convert text to speech using OpenAI TTS"""
        res = self.requestor.post_tts_request(text, voice)
        if res.status_code == 200:
            return res.content
        else:
            print(res.text)
            return None

    def detect_intent_and_generate(self, user_input, image_url=None):
        """
        Intelligently detect user intent and select appropriate model
        """
        print(f"Intent detection - Input: {user_input[:100]}..., Has image: {bool(image_url)}")
        
        if image_url:
            # Image uploaded, use vision model
            print("Using vision model for image understanding")
            yield from self.generate_vision_response_stream(user_input, image_url)
        else:
            # Detect if this is an image generation request
            is_generation = self._is_image_generation_request(user_input)
            print(f"Image generation detection result: {is_generation}")
            
            if is_generation:
                print("Using DALL-E for image generation")
                # Generate image and return result
                result = self.generate_dalle_image(user_input)
                if result['success']:
                    yield f"I've generated an image for you. Description: {result['revised_prompt']}"
                    yield f"[IMAGE:{result['image_url']}]"  # Special marker for frontend recognition
                else:
                    yield f"Image generation failed: {result['error']}"
            else:
                print("Using regular text model")
                # Regular text conversation
                yield from self.generate_massage_stream(user_input)

    def _is_image_generation_request(self, text):
        """
        Detect if this is an image generation request
        """
        image_keywords = [
            '画', '绘制', '生成图片', '生成图像', '创建图片', '创建图像', 
            '图片', '图像', '插画', '画面', '视觉', 'draw', 'generate', 'create', 
            'make', 'paint', 'painting', 'illustration', 'design', 'picture', 
            'image', 'artwork', 'sketch', '设计一个', '帮我画', '我想要一张', 
            '制作图片', '做一张图', 'style', 'artistic'
        ]
        
        # Convert to lowercase for matching
        text_lower = text.lower()
        
        # Check if contains image generation keywords
        for keyword in image_keywords:
            if keyword in text_lower:
                return True
                
        # Check specific generation patterns
        generation_patterns = [
            '画一', '画个', '画出', '生成一', '制作一', '创建一',
            '我想要', '帮我做', '能画', '可以画', '给我画',
            'generate a', 'create a', 'make a', 'draw a', 'paint a',
            'generate an', 'create an', 'make an', 'draw an', 'paint an'
        ]
        
        for pattern in generation_patterns:
            if pattern in text_lower:
                return True
                
        return False





