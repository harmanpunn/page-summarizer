from flask import Flask, jsonify, request
from flask_cors import CORS
import torch
from transformers import BitsAndBytesConfig
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import warnings
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



@app.errorhandler(Exception)
def handle_error(e):
    response = {
        'error': 'An error occurred',
        'message': str(e)
    }
    return jsonify(response), 500


if __name__ == '__main__':
    app.run()
