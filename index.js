import runPage from './run-page.js';
import { makeGif, deletePics } from './run-ffmpeg.js';
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";

import {
  cpScore,
  calculateBoardOutcomes,
  calculateLegalMoves,
} from 'https://denopkg.com/nikfrank/react-sheshbesh/src/util.js';


const { chrome, navigate, runJS, screenshot, click, clickSVG, dblclickSVG } = await runPage();

const wait = async t => await (new Promise(f=> setTimeout(f, t)));

let picCounter = 0;

const savePic = async ()=> {
  const pic = await screenshot();
  await Deno.writeFile('pic'+(++picCounter)+'.png', base64.toUint8Array(pic.data));
};

// wait for page load
await wait(3000);

// speed up timeouts
await runJS('const TO = window.setTimeout; window.setTimeout = (fn, t)=> TO(fn, t/16);');


// wait for roll button or game is over
// if game is over, export gif

// otherwise, click roll button
// read game state
// send to cp decider fn

// if no legal moves, wait until roll

// if moves,
// clickSVG getOutOfJail moves (.Board > g:nth-last-of-type(24-N) rect)
// clickSVG from, clickSVG to regular moves
// dblclickSVG from home moves

// after moves, check if game is over


const roll = ()=> click('.dice-container button');


const getGameState = ()=> runJS(`
JSON.stringify({
  dice: [...document.querySelectorAll('.dice-container svg')].map((_, i)=> 
    document.querySelectorAll('.dice-container svg:nth-child('+(i+1)+') circle').length
  ),
  blackJail: document.querySelectorAll('.Board  > circle.black-chip').length,
  whiteJail: document.querySelectorAll('.Board  > circle.white-chip').length,
  chips: [...document.querySelectorAll('.Board > g:not(:nth-of-type(1)):not(:nth-of-type(2))')].map(chip => ((chip.querySelectorAll('.black-chip').length) - (chip.querySelectorAll('.white-chip').length))),
  blackHome: document.querySelectorAll('.Board .black-home').length,
  whiteHome: document.querySelectorAll('.Board .white-home').length,
  turn: 'black',
})
`);


const getBestMoves = (board)=> {
  const options = calculateBoardOutcomes(board);

  if( !options.length ) return console.log('no move');

  const scoredOptions = options.map(option=> ({
    score: cpScore(option.board), moves: option.moves,
  }));

  const bestMoves = scoredOptions.sort((a, b)=> (b.score - a.score) )[0].moves;

  return bestMoves;
};


// click based on moves.

const clickMove = (async (move)=>{
  for( let i=0, moveFrom, moveTo; i < move.length; i++) {
    if( typeof move[i].moveFrom === 'number' )
      await clickSVG('.Board > g:nth-of-type('+(move[i].moveFrom+3)+') rect');

    if( typeof move[i].moveTo === 'number' )
      await clickSVG('.Board > g:nth-of-type('+(move[i].moveTo+3)+') rect');

    if( (''+move[i].moveTo).includes('Home') )
      await dblclickSVG('.Board > g:nth-of-type('+(move[i].moveFrom+3)+') rect');

    await savePic();
  }
});


await roll();
await savePic();

let gameState = JSON.parse(await getGameState());
let move = getBestMoves(gameState);

await clickMove(move);
await wait(400);


let maxHome = 0;
for( let j=0; j < 40; j++){

  gameState = JSON.parse(await getGameState());
  const nextMax = Math.max(gameState.blackHome, gameState.whiteHome);
  if( nextMax > maxHome ) maxHome = nextMax;
  if( nextMax < maxHome || nextMax === 15 ) break;

  await roll();
  await savePic();

  gameState = JSON.parse(await getGameState());
  move = getBestMoves(gameState);

  if(move) await clickMove(move);
  await wait(400);
}

await makeGif();

await deletePics();

const p = await runJS('Promise.resolve(10)', !!'awaitPromise');

console.log(p);

chrome.close();

Deno.exit(0);
