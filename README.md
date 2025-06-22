# ChaGPT-API-Call

A lightweight Python project demonstrating how to interact with the ChatGPT API. It supports multi-turn dialogue, automatic context management and includes an optional browser interface built with Flask.

## Features
- Multi-turn conversations with context preservation.
- Automatically removes earlier messages when the token length exceeds the limit.
- Optional Flask web interface with streaming responses.
- Simple command line tool for quick testing.

## Installation
1. Install the basic packages:
   ```bash
   pip install openai tiktoken
   ```
   If you experience timeouts, use a mirror:
   ```bash
   pip install tiktoken --timeout=300 -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```
2. For the browser interface install the Flask dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration
Add your OpenAI key to `config/chatgpt_config.py` under `authorization`.

## Usage

### Terminal
Run the script to start a conversation in your terminal:
```bash
python test.py
```
![Terminal demo](https://user-images.githubusercontent.com/17317538/233408407-f798960d-cde1-4f8f-af5a-98edbe7a5dd8.png)

Type `clear` at any time to reset the conversation.

### Browser
Start the Flask server:
```bash
python manager.py
```
Open [http://127.0.0.1:9200/](http://127.0.0.1:9200/) in your browser and you should see:
![Web UI](https://github.com/user-attachments/assets/a60655c7-3e67-4d4c-ad8f-d1d797c2576b)

## Notice
- You may also call the API directly via [OpenAI documentation](https://platform.openai.com/docs/guides/chat), but implementing your own logic offers greater flexibility.
![OpenAI docs screenshot](https://user-images.githubusercontent.com/17317538/222936144-e1b52aa2-b400-4680-a2cb-7dd7ffd99a93.png)
- The default context deletion strategy lives in `tools/utils.py`. Adjust parameters in `config/chatgpt_config.py` if needed.
- Run `test.py` once to verify your API key works. If you exceed your free credits you will receive an error like:
![quota error](https://github.com/ChristopheZhao/ChaGPT-API-Call/assets/17317538/bc9f4165-13bb-48e5-9a7d-adb8bbc12ccf)

## Dialogue Samples

- Multi-turn dialogue  
  ![Multi-turn demo](https://user-images.githubusercontent.com/17317538/222916920-4bf3a9bc-68de-4e3d-86b4-12881c5c6926.png)
- Context preserved after pruning old dialogue  
  ![Context demo](https://user-images.githubusercontent.com/17317538/224521387-cbc3db6b-8638-4ece-bfc5-dbf6dd1d9bdb.png)

## Recent Updates
- Added streaming response display in web interface.
- Improved UI with modern chat-like interface.
- Enhanced error handling and context management.
