import tiktoken


class Tokennizer(object):

    def __init__(self,model_name):
        super().__init__()
        self.encoding = tiktoken.encoding_for_model(model_name)

    def num_tokens_from_string(self,query_string: str) -> int:
        """Returns the number of tokens in a text string."""
        num_tokens = len(self.encoding.encode(query_string))
        return num_tokens

