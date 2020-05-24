export default (async (url='https://www.google.ca/', port=9222)=>{
  
  const p = Deno.run({
    cmd: [
      //'google-chrome',
      //'chromium-browser',
      '../pptr-web/node_modules/puppeteer/.local-chromium/linux-756035/chrome-linux/chrome',
      '--headless',
      '--remote-debugging-port='+port,
      url,
    ],
    stdout: 'piped',
    stderr: 'piped',
  });

  console.log(p.pid);

  const buff = new Uint8Array(210);
  await p.stderr.read(buff);
  const message = new TextDecoder().decode(buff);
  const ws = message.slice(23);

  setTimeout(()=> p.close(), 200000);
  
  return [p, ws];
});
