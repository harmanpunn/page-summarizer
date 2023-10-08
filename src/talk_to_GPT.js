import { config } from "dotenv";
import OpenAIApi from "openai";
import axios from "axios";
import * as cheerio from "cheerio";
import express from "express";
import cors from "cors";

//Read API key from .env file
config();

// API Keys
const GOOGLE_CSE_API_ENDPOINT = "https://www.googleapis.com/customsearch/v1";
const API_KEY = "AIzaSyA9BzAwVPbefgffx6NtZ1nd_5U4XI7edfs"; // Your API key
const CX = "a0737af91bf2b4397"; // Your Custom Search Engine ID

// const openai = new OpenAIApi({
//   apiKey: process.env.OpenAI_API_KEY,
// });

const llm_url = "http://127.0.0.1:5000/";

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

//GPT function
async function talkToGPT(gptPrompt) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: gptPrompt }],
    model: "gpt-3.5-turbo",
  });

  const resposne = chatCompletion.choices[0].message.content;
  return resposne;
}

async function summarize(content) {
  let prompt = `Given the text below, generate its summary in under 60 words.
  
  TEXT:
  ${content}

  SUMMARY:
  `;
  const response = await axios.post(llm_url + "infer", { prompt: prompt });
  if (response.data && response.data.generated_text) {
    const summary = response.data.generated_text;
    return summary;
  } else {
    throw new Error("Unexpected response format");
  }
}

async function chat(data) {
  const response = await axios.post(llm_url + "chat", data);
  console.log(response);
  if (!response.data.response) {
    throw new Error("Unexpected response format");
  }
  return response.data.response;
}

//Scrapper functions
async function getRelevantLinks(headline) {
  const params = {
    key: API_KEY,
    cx: CX,
    q: headline,
  };

  const response = await axios.get(GOOGLE_CSE_API_ENDPOINT, { params });
  const results = response.data.items || [];
  const links = results.slice(0, 3).map((item) => item.link);
  return links;
}

async function getHeadline(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const headline = $("h1").first().text().trim();

  const bodyContent = [];
  $("p").each((index, element) => {
    bodyContent.push($(element).text().trim());
  });
  const bodyExcerpt = bodyContent.join(" ");

  const result = {
    title: headline,
    content: bodyExcerpt,
    relevant_links: await getRelevantLinks(headline),
  };

  return result;
}

app.get("/summarize", (req, res) => {
  const url = req.query.url;
  console.log(url);

  if (url == "test") {
    res.send("Test successful");
  }
  // const { body } = req.body;
  getHeadline(url).then(async (data) => {
    //console.log(data);
    let gptTitle = data.title;
    let gptPrompt = data.content;
    let links = data.relevant_links;

    let response = await summarize(gptPrompt);

    const result = {
      summary: response,
      relevant_links: links,
    };

    res.send(result);
  });
});

app.post("/chat", async (req, res) => {
  if (!req.body.summary || !req.body.history) {
    res.statusCode = 500;
    res.send({ error: "Bad request" });
  }
  let text = await chat(req.body);
  res.send({ text: text, isUser: false });
});

app.listen(PORT, () => {
  console.log("HTTPS Server running on port 3000");
});
