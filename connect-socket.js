import {
  connectWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
} from "https://deno.land/std/ws/mod.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { blue, green, red, yellow } from "https://deno.land/std/fmt/colors.ts";

//const endpoint = 'ws://localhost:9222/devtools/page/A2F1DBAB8D8AB4F59B195CC5AEDC9FB1';

export default async (url='https://www.google.ca/', port=9222)=> {

  const response = await fetch('http://localhost:'+port+'/json')
  const tabs = await response.json();

  // this entails trailing / (as browser fills that in)
  const socketUrl = tabs
    .find((tab={ url: null }) => tab.url === url)
    .webSocketDebuggerUrl;
  
  try {
    const socket = await connectWebSocket(socketUrl);
    console.log(green("ws connected! (type 'close' to quit)"));

    const runCommand = (method='', params={})=>{
      const id = 1*(''+Math.random()).slice(2, 10);
      
      socket.send( JSON.stringify({ id, method, params }) );
      
      return (new Promise(async (fulfill, reject)=> {
        const respond = (res='')=> fulfill(res);

        for await (const msg of socket) {
          if (typeof msg === "string") {
            try {
              const { id: resId, result } = JSON.parse(msg);

              if( id === resId )
                respond( result );
              
            } catch (err) {
              console.log(err);
              console.log('message not valid JSON', msg);
            }
            
          } else if (isWebSocketCloseEvent(msg)) {
            console.log(red(`closed: code=${msg.code}, reason=${msg.reason}`));
          }
        }
      }));
    };


    return {
      socket, runCommand
    };
    
  } catch (err) {
    console.error(red(`Could not connect to WebSocket: '${err}'`));
  }
};
