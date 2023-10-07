import { config } from "dotenv"
import OpenAIApi from "openai"
config()

//console.log(process.env.API_KEY)

const openai = new OpenAIApi({
    apiKey: process.env.API_KEY
})

// const chatCompletion = openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [{role: "user", content: "Hello ChatGPT"}]
// });

// console.log(chatCompletion)

// openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     messages: [{role: "user", content: "Hello ChatGPT"}]
// }).then(res => {
//     console.log(res)
// })


let gptPrompt = 'Tell me a joke'


async function talkToGPT() {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: gptPrompt + 'and then say hi' }],
      model: 'gpt-3.5-turbo',
    });
    
    const resposne = chatCompletion.choices[0].message.content
    console.log(resposne);
  }

talkToGPT();