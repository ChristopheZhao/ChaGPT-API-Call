import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

config_dict = dict(

    Acess_config = dict(
        authorization = os.getenv("OPENAI_API_KEY", "your-api-key-here"),
    ),

    Model_config = dict(
        model_name = "gpt-3.5-turbo",
        request_address = "https://api.openai.com/v1/chat/completions",
        vision_model_name = "gpt-4o",
        dalle_model_name = "dall-e-3",
        dalle_request_address = "https://api.openai.com/v1/images/generations",
    ),

    Context_manage_config = dict(
        max_context = 3200,
        del_config = dict(
        distance_weights=0.05,
        length_weights=0.4,
        role_weights=1,
        sys_role_ratio=3,
        del_ratio = 0.4,
        max_keep_turns=30)
    ),

    generate_config = dict(
        use_cotomize_param = True,
        param_dict = dict(
        temperature = 1,
        stream = False
        )
    ),
)
