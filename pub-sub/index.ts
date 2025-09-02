import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

console.log("Connected");
const sockets: WebSocket[] = [];

wss.on('connection', function connection(ws) {
  sockets.push(ws);
  ws.on('error', console.error);

  ws.on('message', function message(data: string) {
    console.log("Message sent to each Socket: ", data);
    sockets.forEach(s => {
        if (s != ws) s.send(data);
    })
  });

  ws.send('something');
});