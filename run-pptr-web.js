import puppeteer from './puppeteer-web.js';
import procChrome from './proc-chrome.js';

import connectSocket from './connect-socket.js';

const wait = t=> (new Promise(f=> setTimeout(f, t)));

console.log('et', EventTarget);
console.log(puppeteer.connect);

const [proc, ws] = await procChrome();

await wait(900);

const url = 'https://www.google.ca/';
const port = 9222;
const response = await fetch('http://localhost:'+port+'/json')
const tabs = await response.json();

// this entails trailing / (as browser fills that in)
const socketUrl = tabs
  .find((tab={ url: null }) => tab.url === url)
  .webSocketDebuggerUrl;


//const { socket, runCommand } = await connectSocket();


const browser = await puppeteer.connect({
  browserWSEndpoint: socketUrl,
  //`ws://0.0.0.0:8080`, // <-- connect to a server running somewhere
  
  ignoreHTTPSErrors: true
});

const page = await browser.newPage();
await page.goto('http://sheshbesh.nikfrank.com/', {waitUntil: 'networkidle2'});

await page.screenshot({path: 'example.jpeg', fullPage: true, encoding: 'base64' });

const pages = (await browser.pages());
const browserWSEndpoint = await browser.wsEndpoint();



console.log({ browserWSEndpoint, pagesCount: pages.length });
