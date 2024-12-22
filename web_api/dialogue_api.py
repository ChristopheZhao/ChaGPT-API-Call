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
            self.requestor = OpenAI_Request(keys, model_name, request_address,generate_config)
        else:
            self.requestor = OpenAI_Request(keys, model_name,request_address)

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





