

class ContextHandler(object):
    def __init__(self):
        super().__init__()
        self.context = []

    def append_cur_to_context(self,daata,tag=0):

        if tag == 0:
            role = "user"
        elif tag == 1:
            role = "assistant"
        else:
            role = "system"

        role_data = {"role": role, "content": daata}
        self.context.append(role_data)

    def clear(self):
        self.context.clear()