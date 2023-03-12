from tools.utils import del_context

class ContextHandler(object):
    def __init__(self,max_context=3200):
        super().__init__()
        self.context = []
        self.role_lengths = []
        self.max_context = max_context

    def append_cur_to_context(self,data,complete__length,tag=0):

        if tag == 0:
            role = "user"
        elif tag == 1:
            role = "assistant"
        else:
            role = "system"

        role_data = {"role": role, "content": data}
        self.context.append(role_data)
        self.role_lengths.append(complete__length)

    def cut_context(self,cur_total_length,tokenizer):
        del_context(self.context,self.role_lengths,cur_total_length,self.max_context,tokenizer=tokenizer)




    def clear(self):
        self.context.clear()