from flask import Flask, jsonify, request
from flask_cors import CORS
import torch
from transformers import BitsAndBytesConfig
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from transformers import StoppingCriteria,StoppingCriteriaList
import warnings
from langchain import PromptTemplate
from langchain.chains import ConversationChain
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain.llms import HuggingFacePipeline
from langchain.schema import BaseOutputParser
import re
warnings.filterwarnings("ignore")


app = Flask(__name__)
CORS(app)

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)
model_id = "vilsonrodrigues/falcon-7b-instruct-sharded"
model_4bit = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    quantization_config=quantization_config,
)
tokenizer = AutoTokenizer.from_pretrained(model_id)
generation_config = model_4bit.generation_config
generation_config.temperature = 0.1
generation_config.num_return_sequences = 1
generation_config.max_new_tokens = 100
generation_config.use_cache = False
generation_config.repetition_penalty = 1.7
generation_config.pad_token_id = tokenizer.eos_token_id
generation_config.eos_token_id = tokenizer.eos_token_id

class CleanupOutputParser(BaseOutputParser):
    def parse(self, text: str) -> str:
        user_pattern = r"\nUser"
        text = re.sub(user_pattern, "", text)
        human_pattern = r"\nHuman:"
        text = re.sub(human_pattern, "", text)
        ai_pattern = r"\nAI:"
        return re.sub(ai_pattern, "", text).strip()

    @property
    def _type(self) -> str:
        return "output_parser"

class StopGenerationCriteria(StoppingCriteria):
    def __init__(
        self, tokens, tokenizer: AutoTokenizer, device: torch.device
    ):
        stop_token_ids = [tokenizer.convert_tokens_to_ids(t) for t in tokens]
        print(stop_token_ids)
        self.stop_token_ids = [
            torch.tensor(x, dtype=torch.long, device=device) for x in stop_token_ids
        ]
 
    def __call__(
        self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs
    ) -> bool:
        for stop_ids in self.stop_token_ids:
            if torch.eq(input_ids[0][-len(stop_ids) :], stop_ids).all():
                return True
        return False

@app.route('/infer', methods=['POST'])
def infer():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')  # Extract 'content' from JSON, default to an empty string if not present
        if prompt == "":
            return jsonify({"generated_text" : "Unable to generate text"})
        
        tokens = len(tokenizer.tokenize(prompt))
        print(tokens)

        falcon_pipeline = pipeline(
            "text-generation",
            model=model_4bit,
            tokenizer=tokenizer,
            use_cache=True,
            device_map="auto",
            max_length=tokens + 70,
            do_sample=True,
            top_k=10,
            num_return_sequences=1,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )
        result = falcon_pipeline(prompt)[0]

        result["generated_text"] = result["generated_text"].split("SUMMARY:")[1]
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': 'An error occurred', 'message': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        template = """The following is a conversation between a human an AI. The AI is part of a web-page summarizer and it helps the user with any further questions that they might have. Below is the context of the webpage. The AI does not make conversations that are too out of context. The AI makes reasonable assumptions and mentions them if any. AI doesn't blatantly lie to the user. The AI tries to be concise, mostly under 20 words.

CONTEXT:
<<CONTEXT>>

Current conversation:
{history}
Human: {input}
AI:""".strip()
        template = template.replace("<<CONTEXT>>",data.get("summary"))

        prompt = PromptTemplate(input_variables=["history", "input"], template=template)
        history = data.get('history', '')  # Extract 'content' from JSON, default to an empty string if not present    
        stop_tokens = [["Human", ":"], ["AI", ":"]]
        stopping_criteria = StoppingCriteriaList(
            [StopGenerationCriteria(stop_tokens, tokenizer, model_4bit.device)]
        )
        generation_pipeline = pipeline(
            model=model_4bit,
            tokenizer=tokenizer,
            return_full_text=True,
            task="text-generation",
            stopping_criteria=stopping_criteria,
            generation_config=generation_config,
        )
        
        llm = HuggingFacePipeline(pipeline=generation_pipeline)
            
        memory = ConversationBufferWindowMemory(
            memory_key="history", k=6, return_only_outputs=True
        )

        for message in history[-7:-1]:
            print(message)
            if message["isUser"]:
                memory.chat_memory.add_user_message(message["text"])
            else:
                memory.chat_memory.add_ai_message(message["text"])
    
        chain = ConversationChain(
            llm=llm,
            memory=memory,
            prompt=prompt,
            output_parser=CleanupOutputParser(),
            verbose=True,
        )

        result = chain.predict(input=history[-1]["text"])
        return jsonify({"response":result})
    except Exception as e:
        return jsonify({'error': 'An error occurred', 'message': str(e)}), 500


@app.errorhandler(Exception)
def handle_error(e):
    response = {
        'error': 'An error occurred',
        'message': str(e)
    }
    return jsonify(response), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0")
