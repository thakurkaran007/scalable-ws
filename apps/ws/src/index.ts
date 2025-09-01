import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  sockets: WebSocket[];
}

const rooms: Record<string, Room> = {};

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: string) {
    const parsedData = JSON.parse(data);
    const room = parsedData.room;

    switch (parsedData.type) {
      case "join-room":
        if (!rooms[room]) {
          rooms[room] = { sockets: [] };
        }
        rooms[room].sockets.push(ws);
        break;
    
      default:
        break;
    }
  });

});