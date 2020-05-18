export default (url='https://google.ca', port=9222)=>{
  
  const p = Deno.run({
    cmd: [
      'google-chrome',
      '--headless',
      '--remote-debugging-port='+port,
      url,
    ],
  });

  console.log(p.pid);
  
  return p;
};

//setTimeout(()=> process.close(), 20000);
