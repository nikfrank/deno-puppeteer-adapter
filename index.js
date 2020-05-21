import runPage from './run-page.js';
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";

import {
  cpScore,
  calculateBoardOutcomes,
  calculateLegalMoves,
} from 'https://denopkg.com/nikfrank/react-sheshbesh/src/util.js';


const { navigate, runJS, screenshot, click, clickSVG } = await runPage();

const wait = async t => await (new Promise(f=> setTimeout(f, t)));

const rand = await runJS('Math.random()');

console.log(rand);

// wait for page load
await wait(3000);

const roll = await runJS('document.querySelector("button").innerHTML');

console.log(roll);

await runJS('const TO = window.setTimeout; window.setTimeout = (fn, t)=> TO(fn, t/5);');



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

const a = await click('.dice-container button');

await wait(100);

const pic3 = await screenshot();
await Deno.writeFile('pic3.png', base64.toUint8Array(pic3.data));


const getGameState = ()=> runJS(`
const gameState = {
  dice: [...document.querySelectorAll('.dice-container svg')].map((_, i)=> 
    document.querySelectorAll('.dice-container svg:nth-child('+(i+1)+') circle').length
  ),
  blackJail: document.querySelectorAll('.Board  > circle.black-chip').length,
  whiteJail: document.querySelectorAll('.Board  > circle.white-chip').length,
  chips: [...document.querySelectorAll('.Board > g:not(:nth-of-type(1)):not(:nth-of-type(2))')].map(chip => ((chip.querySelectorAll('.black-chip').length) - (chip.querySelectorAll('.white-chip').length))),
  blackHome: document.querySelectorAll('.Board .black-home').length,
  whiteHome: document.querySelectorAll('.Board .white-home').length,
  turn: 'black',
};
JSON.stringify(gameState)
`);

const gameStateString = await getGameState();

console.log('g', gameStateString);

const gameState = JSON.parse(gameStateString);

const getBestMoves = (board)=> {
  const options = calculateBoardOutcomes(board);

  if( !options.length ) return console.log('no move');

  const scoredOptions = options.map(option=> ({
    score: cpScore(option.board), moves: option.moves,
  }));

  const bestMoves = scoredOptions.sort((a, b)=> (b.score - a.score) )[0].moves;

  return bestMoves;
};

const move = getBestMoves(gameState);

console.log(move);



// click based on moves.

await (async ()=>{
  await clickSVG('.Board > g:nth-of-type('+(move[0].moveFrom+3)+') rect');

  const pic4 = await screenshot();
  await Deno.writeFile('pic4.png', base64.toUint8Array(pic4.data));


  await clickSVG('.Board > g:nth-of-type('+(move[0].moveTo+3)+') rect');

  const pic5 = await screenshot();
  await Deno.writeFile('pic5.png', base64.toUint8Array(pic5.data));

})();


const p = await runJS('Promise.resolve(10)', !!'awaitPromise');

console.log(p);
