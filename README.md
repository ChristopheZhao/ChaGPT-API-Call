# ChaGPT-API-Call

## overall
This project uses python to simply implement the experience of how to call Chagpt's api for dialogue and other tasks.

## how to run
1. install openai package use "pip install openai"
2. Add your openAI key to the "authorization" in the config/chatgpt_config.py
3. run this command "python test.py" in your terminal,or run test.py in your ide.

## notice
- 
You can also use the OpenAI api (https://platform.openai.com/docs/guides/chat) to call, but it is more flexible to implement it yourself through the python api request.
- The dialogue is entered directly from the command line. By default, the context of the dialogue will always be accumulated. If you want to clear the context, you can directly enter 'clear' on the command line

## features
- support mutil-turn dialogue

## dialogue show
![image](https://user-images.githubusercontent.com/17317538/222916920-4bf3a9bc-68de-4e3d-86b4-12881c5c6926.png)

