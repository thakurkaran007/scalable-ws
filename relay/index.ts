import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

console.log("Relay server running on port 3001");
const sockets: WebSocket[] = [];

wss.on('connection', function connection(ws) {
  sockets.push(ws);
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log("Relay received:", data.toString());

    
    sockets.forEach(s => {
      if (s !== ws) s.send(data);
    });
  });
});
