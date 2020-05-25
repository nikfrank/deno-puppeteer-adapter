import puppeteer from './puppeteer-web.js';
import procChrome from './proc-chrome.js';

import connectSocket from './connect-socket.js';

const wait = t=> (new Promise(f=> setTimeout(f, t)));

const [proc, ws] = await procChrome();

await wait(900);

const url = 'http://sheshbesh.nikfrank.com/';
const port = 9222;
const response = await fetch('http://localhost:'+port+'/json')
const tabs = await response.json();

// this entails trailing / (as browser fills that in)
const socketUrl = tabs
  .find((tab={ url: null }) => tab.url === url)
  .webSocketDebuggerUrl;


const browser = await puppeteer.connect({
  browserWSEndpoint: socketUrl,
  ignoreHTTPSErrors: true,
});

const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle2' });

let picCount = 0;

await page.screenshot({
  path: `pic${picCount++}.jpeg`,
  fullPage: true,
  encoding: 'base64',
});


const svg = await page.evaluate( ()=> document.querySelectorAll('svg').length );

console.log('svg', svg);

const gameState = await page.evaluate(()=> ({
  dice: [...document.querySelectorAll('.dice-container svg')].map((_, i)=> 
    document.querySelectorAll('.dice-container svg:nth-child('+(i+1)+') circle').length
  ),
  blackJail: document.querySelectorAll('.Board  > circle.black-chip').length,
  whiteJail: document.querySelectorAll('.Board  > circle.white-chip').length,
  chips: [...document.querySelectorAll('.Board > g:not(:nth-of-type(1)):not(:nth-of-type(2))')].map(chip => ((chip.querySelectorAll('.black-chip').length) - (chip.querySelectorAll('.white-chip').length))),
  blackHome: document.querySelectorAll('.Board .black-home').length,
  whiteHome: document.querySelectorAll('.Board .white-home').length,
  turn: 'black',
}));

console.log(gameState);

const pages = (await browser.pages());
const browserWSEndpoint = await browser.wsEndpoint();



console.log({ browserWSEndpoint, pagesCount: pages.length });
