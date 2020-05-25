
## deno - dino, deino, dyno, dayenu.

steps:

run chrome headless with some debugging port (9222)

(https://medium.com/@lagenar/using-headless-chrome-via-the-websockets-interface-5f498fb67e0f)

request localhost:9222/json, this will give you `.webSocketDebuggerUrl`

now we establish a websocket connection

now we can send debugger requests to the headless browser

{ id, method, params }

method is structured as Domain.method (eg Page.navigate)


can load up localhost:9222 to see a fake head for the headless chrome

connecting to websocket using

https://deno.land/std/ws/README.md

---

great - that POC worked

next, let's turn this bogus little demo into something resembling a useful API


--> need to run the headless chrome process from deno

https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.run


export a factory for

- chrome headless process
- websocket connection thereto
- utility function for socket headless-protocol io


```
js = """
var sel = '[role="heading"][aria-level="2"]';
var headings = document.querySelectorAll(sel);
headings = [].slice.call(headings).map((link)=>{return link.innerText});
JSON.stringify(headings);
"""
```

result = run_command(conn, 'Runtime.evaluate', expression=js)



---

screenshots

https://medium.com/@dschnr/using-headless-chrome-as-an-automated-screenshot-tool-4b07dffba79a

after each roll, and each move

-> output images into some dir, process into gif

https://deno.land/typedoc/modules/deno.html#writefile
https://deno.land/x/base64/README.md

https://stackoverflow.com/questions/53437400/how-to-set-frame-delay-when-use-ffmpeg-to-convert-images-to-gif



---

publishing a deno "module"

deno headless adapter

...





---

working with deno

(ts issues, MDN > deno.land)

pretty, pretty good



working with chrome headless

`ps -aux | grep chrome` sux

localhost:9222 -> put the head back on, can debug something you're automating

running a command outside the protocol fails silently
