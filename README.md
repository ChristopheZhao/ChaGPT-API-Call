# ChaGPT-API-Call

## overall
This project uses python to simply implement the experience of how to call Chagpt's api for dialogue and other tasks.

## how to run
1. install python package:
  - install openai api(optional): "pip install openai"
  - install tiktoken to calculate the length of tokens: "pip install tiktoken" ,if tips "time out",please add the local sources,such as "pip install tiktoken --timeout=300 -i https://pypi.tuna.tsinghua.edu.cn/simple"
4. Add your openAI key to the "authorization" in the config/chatgpt_config.py
5. run this command "python test.py" in your terminal,or run test.py in your ide.

## notice
- You can also use the OpenAI api (https://platform.openai.com/docs/guides/chat) to call, but it’s more flexible and convenient to implement by yourself to expand more applicatioins.
- The recently added method of deleting the above dialogue is implemented in tools/utils.py. At present, I think there is still a lot of room for optimization in this method. I have tried the relevant parameters and this group of parameters is relatively reasonable. You can also Configure in the config.py file

![image](https://user-images.githubusercontent.com/17317538/222936144-e1b52aa2-b400-4680-a2cb-7dd7ffd99a93.png)

- The dialogue is entered directly from the command line. By default, the context of the dialogue will always be accumulated. If you want to clear the context, you can directly enter 'clear' on the command line

## features
- support mutil-turn dialogue
- support delete the former dialogue automatically when the token length exceeds the limit of OpenAI API

## dialogue show
![image](https://user-images.githubusercontent.com/17317538/222916920-4bf3a9bc-68de-4e3d-86b4-12881c5c6926.png)

