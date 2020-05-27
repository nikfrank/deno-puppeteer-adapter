export const makeGif = ()=> {
  const p = Deno.run({
    cmd: [
      'ffmpeg',
      '-framerate', '2',
      '-i', 'pic%d.png',
      '-s', '400x266',
      'output.gif'
    ],
    stdout: 'piped',
  });

  return p.output(); // wait for process to end
};

export const deletePics = async ()=> {
  for await (const file of Deno.readDir("./")) {
    if( file.name.match(/pic\d+\.png/) )
      await Deno.remove(file.name);
  }
};
