from config.chatgpt_config import config_dict
from src.openai_request import OpenAI_Request
import time
from tools.cfg_wrapper import load_config
from tools.context import ContextHandler


def chat_test(keys,model_name,request_address,context_handler,log_time=False):

    requestor = OpenAI_Request(keys, model_name,request_address)

    while 1:
        input_s = input('\nuser input : ')

        if input_s == "clear":
            context_handler.clear()
            print('start a new session')
            continue
        else:
            context_handler.append_cur_to_context(input_s)

        st_time = time.time()

        res = requestor.post_request(context_handler.context)
        ed_time = time.time()

        response = res.json()['choices'][0]['message']['content']
        #cut \n for show
        response = response.lstrip("\n")
        print(f"\nresponse : {response}")

        "\ns".lstrip("\n")

        if res.status_code == 200:
            context_handler.append_cur_to_context(response, tag=1)

        if log_time:
            print(f'time cost : {ed_time - st_time}')


if __name__ == '__main__':

    # load config
    config = load_config(config_dict)
    keys = config.Acess_config.authorization
    model_name = config.Model_config.model_name
    request_address = config.Model_config.request_address

    # load context
    context = ContextHandler()
    chat_test(keys,model_name,request_address,context)