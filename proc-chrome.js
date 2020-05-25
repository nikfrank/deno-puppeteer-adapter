export default (async (url='http://sheshbesh.nikfrank.com/', port=9222)=>{
  
  const process = Deno.run({
    cmd: [
      //'google-chrome',
      //'chromium-browser',
      '../pptr-web/node_modules/puppeteer/.local-chromium/'+
      'linux-756035/chrome-linux/chrome',
      
      '--headless',
      '--remote-debugging-port='+port,
      url,
    ],
    stdout: 'piped',
    stderr: 'piped',
  });

  const buff = new Uint8Array(255);
  await process.stderr.read(buff);
  const message = new TextDecoder().decode(buff);
  const wsUrl = message.slice(23);

  setTimeout(()=> process.close(), 200000);
  
  return [process, wsUrl];
});


