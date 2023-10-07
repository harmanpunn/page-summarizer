const axios = require('axios');
const cheerio = require('cheerio');

const GOOGLE_CSE_API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const API_KEY =  // Your API key
const CX =   // Your Custom Search Engine ID

async function getRelevantLinks(headline) {
    const params = {
        key: API_KEY,
        cx: CX,
        q: headline
    };

    const response = await axios.get(GOOGLE_CSE_API_ENDPOINT, { params });
    const results = response.data.items || [];
    const links = results.slice(0, 3).map(item => item.link);
    return links;
}

async function getHeadline(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const headline = $('h1').first().text().trim();

    const bodyContent = [];
    $('p').each((index, element) => {
        bodyContent.push($(element).text().trim());
    });
    const bodyExcerpt = bodyContent.join(' ');

    const result = {
        title: headline,
        content: bodyExcerpt,
        relevant_links: await getRelevantLinks(headline)
    };

    return result;
}

// Example usage:
url ='https://www.theguardian.com/sport/2023/oct/07/max-verstappen-wins-f1-world-title-after-perez-crashes-out-of-qatar-gp-sprint-race'

getHeadline(url).then(data => {
    console.log(data);
});

