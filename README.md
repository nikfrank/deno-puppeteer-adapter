# deno puppeteer adapter

```js
import {
  runChrome.
  puppeteer,
} from 'https://denopkg.com/nikfrank/deno-puppeteer-adapter/index.js';


const [process, ws] = await runChrome();

//... ws is the address of chrome's top level socket
//... I don't ever use it, idk maybe you need it



// wait for chrome to open the websocket
const wait = t=> (new Promise(f=> setTimeout(f, t)));
await wait(900);


// load the url for the socket we want

const url = 'http://sheshbesh.nikfrank.com/';
const port = 9222;
const response = await fetch('http://localhost:'+port+'/json')
const tabs = await response.json();

const socketUrl = tabs
  .find((tab={ url: null }) => tab.url === url)
  .webSocketDebuggerUrl;


// connect puppeteer to it

const browser = await puppeteer.connect({
  browserWSEndpoint: socketUrl,
  ignoreHTTPSErrors: true,
});

const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle2' });

// now you can do anything with puppeteer you want!

process.close();

Deno.exit(0);

```


## Contributing

If puppeteer in Deno is a serious need in your life, I suggest going through the same process I did so you can be sufficiently confident for your serious need. Rough notes on the process are available in buildnotes.md

in doing so, you could browserify a latest copy of puppeteer-core, if you need to!

please inspect the shims I did by comparing ./puppeteer-web.js in this repo to the npmjs package of the same name

I would also suggest forking the repo, as I'm not committed to future development.


---



MIT License

Some work on this project was conducted in Judea / Samaria

if your interpretation of UNSC 242 differs from mine, feel free to boycott!