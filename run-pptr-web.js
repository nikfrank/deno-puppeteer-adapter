import { puppeteer, runChrome } from './index.js';

//import puppeteer from './puppeteer-web.js';
//import procChrome from './proc-chrome.js';

import { makeGif, deletePics } from './run-ffmpeg.js';

import {
  cpScore,
  calculateBoardOutcomes,
  calculateLegalMoves,
} from 'https://denopkg.com/nikfrank/react-sheshbesh/src/util.js';


const wait = t=> (new Promise(f=> setTimeout(f, t)));

const [proc, ws] = await runChrome();

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


const pageDriver = {
  picCount: 0,

  savePic: selector=> !selector ? page.screenshot({
    path: `pic${pageDriver.picCount++}.png`,
    fullPage: true,
    encoding: 'base64',
  }) : (async ()=>{
    
    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (!element)
        return null;
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
    }, selector);

    if (!rect)
      throw Error(`Could not find element that matches selector: ${selector}.`);

    return await page.screenshot({
      path: `pic${pageDriver.picCount++}.png`,
      clip: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
      encoding: 'base64',
    });
  })(),

  click: selector=> page.evaluate(selector=> {
    if( !document.querySelectorAll(selector).length ) return 'blah'
    
    document.querySelector(selector).click()
  }, selector),
  
  clickSVG: selector=> page.evaluate((selector)=>{
    const event = document.createEvent("SVGEvents");
    event.initEvent("click",true,true);
    document.querySelector(selector).dispatchEvent(event);
  }, selector),

  dblclickSVG: selector=> page.evaluate((selector)=> {
    const event = document.createEvent("SVGEvents");
    event.initEvent("dblclick",true,true);
    document.querySelector(selector).dispatchEvent(event);
  }, selector),
}



const getGameState = ()=> page.evaluate(()=> ({
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


const getBestMoves = (board)=> {
  const options = calculateBoardOutcomes(board);

  if( !options.length ) return console.log('no move', board.dice);

  const scoredOptions = options.map(option=> ({
    score: cpScore(option.board), moves: option.moves,
  }));

  const bestMoves = scoredOptions.sort((a, b)=> (b.score - a.score) )[0].moves;

  return bestMoves;
};


// click based on moves.
let prev, gameState;

const clickMove = (async (move)=>{
  for( let i=0, moveFrom, moveTo; i < move.length; i++) {
    gameState = await getGameState();
    prev = gameState.dice.toString() + gameState.chips.toString();
    
    if( typeof move[i].moveFrom === 'number' )
      await pageDriver.clickSVG('.Board > g:nth-of-type('+(move[i].moveFrom+3)+') rect');

    if( typeof move[i].moveTo === 'number' )
      await pageDriver.clickSVG('.Board > g:nth-of-type('+(move[i].moveTo+3)+') rect');

    if( (''+move[i].moveTo).includes('Home') )
      await pageDriver.dblclickSVG('.Board > g:nth-of-type('+(move[i].moveFrom+3)+') rect');

    gameState = await getGameState();
    if( (gameState.dice.toString() + gameState.chips.toString()) !== prev )
      await pageDriver.savePic('svg');
  }
});


await page.evaluate(()=>{
  const TO = window.setTimeout;
  window.setTimeout = (fn, t)=> TO(fn, t/4);
});

const roll = ()=> pageDriver.click('.dice-container button');


await roll();
await pageDriver.savePic('svg');

gameState = await getGameState();
let move = getBestMoves(gameState);

await clickMove(move);

let maxHome = 0;
for( let j=0; j < 200; j++){
  gameState = await getGameState();
  if( (gameState.dice.toString() + gameState.chips.toString()) !== prev )
    await pageDriver.savePic('svg');

  
  const nextMax = Math.max(gameState.blackHome, gameState.whiteHome);
  if( nextMax > maxHome ) maxHome = nextMax;
  if( nextMax < maxHome || nextMax === 15 ) break;

  await roll();
  await wait(20);

  if( (gameState.dice.toString() + gameState.chips.toString()) !== prev ){
    await pageDriver.savePic('svg');
    
    gameState = await getGameState();
    move = getBestMoves(gameState);

    if(move){
      await clickMove(move);
      await pageDriver.savePic('svg');
    }
  }

  prev = gameState.dice.toString() + gameState.chips.toString();

  await wait(100);
}

await makeGif();

await deletePics();

proc.close();
Deno.exit(0);
