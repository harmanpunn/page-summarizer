import { config } from "dotenv"
import OpenAIApi from "openai"

//Read API key from .env file
config()
//console.log(process.env.API_KEY)

const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json())

app.listen(
    PORT,
    () => console.log(`server running on ${PORT}`)
)

app.get('/talk_to_GPT', (req, res) => {
    const url = req.params['url'];
    //const { body } = req.body;
    
    response = talkToGPT(gptPrompt1 + additionalInput);
    res.send(response);

})

const openai = new OpenAIApi({
    apiKey: process.env.API_KEY
})

// const title = response.title;
// const content = response.content;

let gptPrompt1 = 'Body Excerpt: Much as it was a mere formality, Max Verstappen nonetheless closed out his third Formula One world championship with all the assured control with which he has absolutely dictated this season. The Dutchman sealed the title with an at times tense but decisive drive, taking second place in the sprint race at the Qatar Grand Prix meeting. It concludes what has been an utterly dominant season for Verstappen and his Red Bull team, who have now taken the drivers’ and constructors’ championship double this year, the team’s sixth. “Unbelievable guys, I don’t know what to say,” he told the team. “An incredible year, it is such a car. I want to thank everyone at the track and back at the factory, to achieve something like this I can’t thank you all enough.” Verstappen clinched the championship, his third in succession, in the 19-lap dash at the Lusail circuit in Doha, the short form race appropriately all that was needed to secure the three points the 26-year-old required. By claiming it before Sunday’s grand prix Verstappen has equalled Michael Schumacher’s record of taking the title with six races remaining. The title had never been in doubt such has been Verstappen’s superiority over the rest of the field. He has taken 13 wins from 16 races, including a record-breaking run of 10 consecutive victories that ensured he was all but untouchable. Red Bull, too, have been the class of the field, beaten only once, by Ferrari’s Carlos Sainz at the Singapore GP. Verstappen has exploited it. Among many relentless drives from pole to the flag he also returned several impressive comeback drives, proving he was all but unbeatable from almost anywhere on the grid. He beat his Red Bull teammate, Sergio Pérez, into a very distant second, now 184 points behind, a gap unbridgeable even with so many races remaining. The Mexican has long since been out of the championship, having been repeatedly unable to match Verstappen in qualifying or race pace. The sprint was an unusually hectic affair, peppered with safety cars, some dramatic passes and clashes and was deservedly won by Oscar Piastri, the McLaren rookie’s first F1 victory. Yet Verstappen knew what was required and he duly delivered, coming back from fifth after a slow start to claim second. More than was ultimately required after Pérez, his only rival, was taken out of the race by Esteban Ocon. With this title Verstappen is in rare company indeed, matching Ayrton Senna, Jack Brabham, Sir Jackie Stewart, Niki Lauda and Nelson Piquet. Sign up to The Recap The best of our sports journalism from the past seven days and a heads-up on the weekend’s action after newsletter promotion In taking the title in the sprint Verstappen is the first driver to do so in one of the short format races and the first to secure it on a Saturday since Piquet did so at the South African Grand Prix in 1983. Before any running began on Saturday serious concerns were raised over tyre safety. Pirelli had observed significant tyre damage after Friday qualifying, causing the tyre manufacturer and FIA to consider imposing usage limits in the GP to 20 and 22 laps for new and used tyres respectively and also potentially a mandatory three pit stop-race. They will make a decision after examination of the tyres used in the sprint. Pirelli feared potential tyre failure by the extensive use of the 50mm pyramid kerbs over which the cars were riding, causing immense stress on the sidewalls of the tyres. An additional 10 minute practice session was introduced on Saturday to allow teams to adapt to new track limit restrictions imposed to keep the cars off the kerbs.'
let additionalInput = '\nSummarize this article for me in 60 words.'


async function talkToGPT(gptPrompt) {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: gptPrompt }],
      model: 'gpt-3.5-turbo',
    });
    
    const resposne = chatCompletion.choices[0].message.content
    return resposne
    //console.log(resposne);
  }


