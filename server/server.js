// backend/index.js
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors({}));
app.use(express.json());

let cachedEvents = [];

// Function to scrape events from Eventbrite Sydney
async function scrapeEvents() {
    const url = 'https://www.eventbrite.com.au/d/australia--sydney/events/';
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const events = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('div.small-card-mobile.eds-l-pad-all-2')];
        return cards.map(card => {
            try {
                const link = card.querySelector('a.event-card-link');
                const title = card.querySelector('h3.event-card__clamp-line--two')?.innerText || '';  // updated here
                const url = link?.href || '';
                const image = card.querySelector('img.event-card-image')?.src || '';
                const datetime = card.querySelector('p.Typography_body-md-bold__487rx')?.innerText || '';
                const location = link?.getAttribute('data-event-location') || '';
                const price = card.querySelector('div.DiscoverVerticalEventCard-module__priceWrapper___usWo6 p')?.innerText || '';
                return { title, url, image, datetime, location, price };
            } catch {
                return null;
            }
        }).filter(e => e !== null);
    });

    console.log('Scraped event titles:');
    events.forEach((e, i) => {
        console.log(`${i + 1}. ${e.title}`);
    });

    await browser.close();
    return events;
}

// Initial scrape and cache
(async () => {
    console.log('Scraping initial events...');
    cachedEvents = await scrapeEvents();
    console.log(`Scraped ${cachedEvents.length} events.`);
})();

// Periodic update every 15 minutes
setInterval(async () => {
    console.log('Refreshing events...');
    cachedEvents = await scrapeEvents();
    console.log(`Updated to ${cachedEvents.length} events.`);
}, 15 * 60 * 1000);

app.get('/api/events', (req, res) => {
    res.json(cachedEvents);
});

const emailOptIns = {}; // { eventId: [emails] }

app.post('/api/tickets', (req, res) => {
    const { email, eventUrl } = req.body;
    if (!email || !eventUrl) return res.status(400).json({ error: 'Missing email or eventUrl' });

    // Save email (for demo, just console and store in memory)
    if (!emailOptIns[eventUrl]) emailOptIns[eventUrl] = [];
    emailOptIns[eventUrl].push(email);
    console.log(`Email captured for ${eventUrl}: ${email}`);

    res.json({ message: 'Email captured' });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
