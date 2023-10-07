from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI()

# Set up CORS
origins = [
    "http://localhost",
    "http://localhost:8080", 
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/generate")
def generate():
    return {
        "id": str(uuid.uuid4()),
        "summary": "NaturalNatural resources, Earth's gifts, encompass air, water, minerals, and plants. Essential for life and human advancement, they fuel our daily needs and industrial ambitions. Sustainable management is crucial, ensuring future generations can also benefit. Over-exploitation poses grave threats, emphasizing conservation's importance. Harnessing these resources responsibly is our collective responsibility to maintain ecological balance."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
