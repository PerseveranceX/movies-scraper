const puppeteer = require('puppeteer');
const express = require('express');

const hideBrowser = true;

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: hideBrowser });//Launch the headless browser
    const page = await browser.newPage();//open a new page
    await page.goto(url, { timeout: 120 * 1000 });//go to the movie url in the new page

    await page.setRequestInterception(true);//Prevent redirects
    page.on('request', request => {
        if (request.isNavigationRequest() && request.redirectChain().length !== 0) {
            request.abort();
        } else {
            request.continue();
        }
    });
    const playSelector = 'div.icon-play';//The player button that navigates to the page where the actual movie is
    await page.waitForSelector(playSelector);//Wait until it's loaded in the page
    await page.click(playSelector);//Click on it
    await page.waitForSelector('iframe');//Wait untill the iframe that has the embeded url is loaded
    let directWatchURL = await page.$eval("iframe", element => element.getAttribute("src"));//Get the embeded url
    browser.close();//Close the browser

    return directWatchURL;//return the watch url
}


const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use('/', express.static('front'));//Everything in the 'front' folder will be served to the root / directory

app.post('/movies', (request, response) => {
    scrape(request.body.movieURL).then(result => {
        response.send({ 'movieURL': result });
    }).catch(err => {
        console.log(err);
    });

});

app.use(function (req, res, next) {
    res.status(404);
    res.send('404: Page Not Found!');
});

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});