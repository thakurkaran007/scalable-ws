import { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8081 });

interface Rooms {
  sockets: WebSocket[];
}

const RELAYER_URL = 'ws://localhost:3001';
const relaySocket = new WebSocket(RELAYER_URL);

const rooms: Record<string, Rooms> = {};

relaySocket.onmessage = ({ data }) => {
  const strData = typeof data === "string" ? data : data.toString();
  console.log("Received from relay:", strData);

  try {
    const parsed = JSON.parse(strData);
    const { roomId, type, message } = parsed;

    if (type === "chat" && rooms[roomId]) {
      rooms[roomId].sockets.forEach(s =>
        s.send(JSON.stringify({ type: "chat", message }))
      );
    }
  } catch (err) {
    console.error("Failed to parse relay message:", err);
  }
};



wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: string) {
    const parsedMessage = JSON.parse(data);
    const { type, roomId, message: chatMsg } = parsedMessage;

    switch (type) {
      case 'join-room':
        if (!rooms[roomId]) {
          rooms[roomId] = { sockets: [] };
        }
        rooms[roomId].sockets.push(ws);
        break;

      case 'chat':
        relaySocket.send(JSON.stringify({ type: 'chat', roomId, message: chatMsg }));
        break;

      default:
        break;
    }
  });

  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server' }));
});