const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();

const news = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.thetimes.co.uk'
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change/',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.telegraph.co.uk'
    },
    {
        name: 'nytimes',
        address: 'https://www.nytimes.com/section/climate',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.nytimes.com'
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.co.uk/news/science_and_environment',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.bbc.co.uk'
    },
    {
        name: 'reuters',
        address: 'https://www.reuters.com/news/archive/climateChangeNews',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.reuters.com'
    },
    {
        name: 'cnn',
        address: 'https://edition.cnn.com/specials/world/one-good-thing',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://edition.cnn.com'
    },
    {
        name: 'aljazeera',
        address: 'https://www.aljazeera.com/topics/issues/climate-change.html',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.aljazeera.com'
    },
    {
        name: 'independent',
        address: 'https://www.independent.co.uk/environment/climate-change',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.independent.co.uk'
    },
    {
        name: 'washingtonpost',
        address: 'https://www.washingtonpost.com/climate-environment/',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.washingtonpost.com'
    },
    {
        name: 'theguardianau',
        address: 'https://www.theguardian.com/au/environment/climate-crisis',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'theguardianuk',
        address: 'https://www.theguardian.com/uk/environment/climate-crisis',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'theguardianus',
        address: 'https://www.theguardian.com/us/environment/climate-crisis',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'theguardianint',
        address: 'https://www.theguardian.com/international/environment/climate-crisis',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'theguardianau',
        address: 'https://www.theguardian.com/au/environment/climate-crisis',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'theguardianuk',
        address: 'https://www.theguardian.com/uk/environment/climate-crisis',
        selector: 'a:contains("climate"), a:contains("Climate"), a:contains("crisis"), a:contains("warming"), a:contains("environment")',
        base: 'https://www.theguardian.com'
    },
]

const articles = [];

app.get('/', (req, res) =>  {
    res.json('Welcome to my climate change news API, visit /news to get the latest news on climate change. For specific data search for the news source e.g /news/thetimes');
});

news.forEach(news => {
    axios.get(news.address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            $(news.selector).each(function() {
                const title = $(this).text();
                const url = $(this).attr('href');
                articles.push({
                    title,
                    url: news.base + url,
                    source: news.name
                });
            });
        })
        .catch(error => {
            console.error('Error: ', error);
        });
});

app.get('/news', (req, res) => {
    res.json(articles);
});

app.get('/news/:newsId', async (req, res) => {
    const newsId = req.params.newsId;
    const source = news.find(item => item.name === newsId);

    if (!source || !source.address) {
        return res.status(404).json({ error: 'News source not found' });
    }

    try {
        const response = await axios.get(source.address);
        const html = response.data;
        const $ = cheerio.load(html);
        const specificArticles = [];

        $(source.selector).each(function() {
            const title = $(this).text().trim();
            const url = $(this).attr('href');

            if (title && url) {
                specificArticles.push({
                    title,
                    url: url.startsWith('http') ? url : source.base + url,
                    source: newsId
                });
            }
        });
        res.json(specificArticles);
    } catch (error) {
        console.error('Error fetching specific news:', error);
        res.status(500).json({ error: 'An error occurred while fetching news articles' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
