import runPage from './run-page.js';
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";

const { navigate, runJS, screenshot, click, clickSVG } = await runPage();

const wait = async t => await (new Promise(f=> setTimeout(f, t)));

const rand = await runJS('Math.random()');

console.log(rand);

// wait for page load
await wait(3000);

const roll = await runJS('document.querySelector("button").innerHTML');

console.log(roll);

await runJS('const TO = window.setTimeout; window.setTimeout = (fn, t)=> TO(fn, t/5);');

const a = await click('.dice-container button');

await wait(100);

const pic3 = await screenshot();
await Deno.writeFile('pic3.png', base64.toUint8Array(pic3.data));


const gameState = await runJS(`
const gameState = {
  dice: [...document.querySelectorAll('.dice-container svg')].map((_, i)=> 
    document.querySelectorAll('.dice-container svg:nth-child('+(i+1)+') circle').length
  ),
  blackJail: document.querySelectorAll('.Board  > circle.black-chip').length,
  whiteJail: document.querySelectorAll('.Board  > circle.white-chip').length,
  board: [...document.querySelectorAll('.Board > g:not(:nth-of-type(1)):not(:nth-of-type(2))')].map(chip => ((chip.querySelectorAll('.white-chip').length) - (chip.querySelectorAll('.black-chip').length))),
  blackHome: document.querySelectorAll('.Board .black-home').length,
  whiteHome: document.querySelectorAll('.Board .white-home').length,
};
JSON.stringify(gameState)
`);


console.log('g', gameState);

const p = await runJS('Promise.resolve(10)', !!'awaitPromise');

console.log(p);
