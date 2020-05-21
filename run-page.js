import runChrome from './run-chrome.ts';
import connectSocket from './connect-socket.js';

export default async (url='http://sheshbesh.nikfrank.com/')=>{

  // runChrome(PORT, url), which will bear a promise for when it closes
  // this may entail window.addEventListener('close-chrome')
  
  const chrome = runChrome(url);

  // wait for chrome to be listening
  // probably should listen to stdout instead
  
  await (new Promise(f=> setTimeout(f, 900)));


  // connectSocket(PORT, url)
  //   make a request to http://localhost:PORT/json
  //     read .webSocketDebuggerUrl from the item with the correct url
  //   connect to the socket

  const { socket, runCommand } = await connectSocket(url);

  
  // now that there is a connection instance,
  // export functions:
  // - navigate
  // - runJS
  
  const two = await runCommand('Runtime.evaluate', { expression: '1+1' });
  console.log(two.result.value);
  
  const pageDriver = {
    navigate: url => runCommand('Page.navigate', { url }),

    // userGesture: true?
    runJS: (expression, awaitPromise=false) =>
      runCommand('Runtime.evaluate', { expression, awaitPromise })
      .then(res => res.result.value),

    screenshot: ()=> runCommand('Page.captureScreenshot'),
    click: selector=> runCommand('Runtime.evaluate', {
      expression : 'document.querySelector("'+selector+'").click()'
    }),

    clickSVG: selector=> pageDriver.runJS(`
(event => {
  event.initEvent("click",true,true);
  document.querySelector("${selector}").dispatchEvent(event);
})(document.createEvent("SVGEvents"));
`),
    dblclickSVG: selector=> pageDriver.runJS(`
(event => {
  event.initEvent("dblclick",true,true);
  document.querySelector("${selector}").dispatchEvent(event);
})(document.createEvent("SVGEvents"));
`),
    chrome,
  };

  return pageDriver;
};
