

export default (url='https://sheshbesh.nikfrank.com/', port=9222)=>{
  
  const p = Deno.run({
    cmd: [
      'google-chrome',
      '--headless',
      '--remote-debugging-port='+port,
      url,
    ],
  });

  return p;
};

