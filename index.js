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

const svg = await runJS('document.querySelector("svg").innerHTML');

console.log(svg.slice(0, 100));

const pic1 = await screenshot();

const pic2 = await screenshot();


const a = await click('.dice-container button');

await wait(1000);

const pic3 = await screenshot();

console.log(pic1.data.length, pic2.data.length, pic3.data.length);


await Deno.writeFile('pic1.png', base64.toUint8Array(pic1.data));
await Deno.writeFile('pic2.png', base64.toUint8Array(pic2.data));
await Deno.writeFile('pic3.png', base64.toUint8Array(pic3.data));


const p = await runJS('Promise.resolve(10)', !!'awaitPromise');

console.log(p);
