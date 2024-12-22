import requests
import json

class OpenAI_Request(object):

    def __init__(self,key,model_name,request_address,generate_config=None):
        super().__init__()
        self.headers = {"Authorization":f"Bearer {key}","Content-Type": "application/json"}
        self.model__name = model_name
        self.request_address = request_address
        self.generate_config = generate_config

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
        print("Preparing stream request...")  # 调试日志
        
        data = {
            "model": self.model__name,
            "messages": message,
            "stream": True,
        }

        if self.generate_config:
            for k,v in self.generate_config.param_dict.__dict__.items():
                if k != 'stream':
                    data[k] = v
                    
        print(f"Request data: {json.dumps(data)}")  # 调试日志
        
        try:
            response = requests.post(
                self.request_address, 
                headers=self.headers, 
                data=json.dumps(data),
                stream=True,
                timeout=30  # 添加超时设置
            )
            print(f"API response status: {response.status_code}")  # 调试日志
            return response
        except Exception as e:
            print(f"Request error: {e}")  # 调试日志
            raise


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

