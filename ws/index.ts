import { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import Redis from 'ioredis';

const wss = new WebSocketServer({ port: 8081 });
const pub = new Redis();
const sub = new Redis();

interface Rooms {
  sockets: WebSocket[];
}
const rooms: Record<string, Rooms> = {};

function subscribeToRoom(roomId: string) {
  //***For Hundred users work fine  */
  // sub.subscribe(`room:${roomId}`, (err) => {
  //   if (err) console.error("Redis subscribe error:", err);
  //   else console.log(`Subscribed to room:${roomId}`);
  // })

  // if Millions of users are there redis needs to kkep track of million
  sub.psubscribe("room:*");

  sub.on("pmessage", (pattern, channel, message) => {
    console.log(pattern); // 'room:*'
    const roomId = channel.split(":")[1];

    if (roomId && rooms[roomId]) {
      rooms[roomId].sockets.forEach(s => {
        if (s.readyState === s.OPEN) {
          s.send(message);
        }
      })
    }
  })
}

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: string) {
    const parsedMessage = JSON.parse(data);
    const { type, roomId, message } = parsedMessage;

    switch (type) {
      case 'join-room':
        if (!rooms[roomId]) {
          rooms[roomId] = { sockets: [] };
        }
        rooms[roomId].sockets.push(ws);
        subscribeToRoom(roomId);
        break;

      case 'chat':
        pub.publish(`room:${roomId}`, JSON.stringify({ type, message, roomId}));
        break;

      default:
        break;
    }
  });

  ws.onclose = () => {
    for (const roomId in rooms) {
      if (rooms[roomId]) {
        rooms[roomId].sockets = rooms[roomId].sockets.filter(s => s != ws);
        if (rooms[roomId].sockets.length === 0) {
          delete rooms[roomId];
        }
      }
    }
  }
});