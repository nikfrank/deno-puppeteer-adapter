import runPage from './run-page.js';

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

console.log(pic1);

const pic2 = await screenshot();

console.log(pic2);


const a = await click('.dice-container button');

await wait(1000);

const pic3 = await screenshot();

console.log(pic3);

console.log(pic1.data.length, pic2.data.length, pic3.data.length);
