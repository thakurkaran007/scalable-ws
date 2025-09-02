import {test, describe, expect} from 'bun:test';

const BACKEND_URL1 = 'ws://localhost:8080';
const BACKEND_URL2 = 'ws://localhost:8081';

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve) => {
    if (ws.readyState === ws.OPEN) {
      resolve();
    } else {
      ws.onopen = () => resolve();
    }
  });
}

describe("Chat Application", () => {
  test("Message sent from 8080 -> 8081", async () => {
    const ws1 = new WebSocket(BACKEND_URL1);
    const ws2 = new WebSocket(BACKEND_URL2);

    // ✅ wait until both sockets are open
    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    ws1.send(JSON.stringify({
      type: "join-room",
      roomId: "room-1"
    }));

    ws2.send(JSON.stringify({
      type: "join-room",
      roomId: "room-1"
    }));

    await new Promise<void>((resolve, reject) => {
      ws2.onmessage = ({ data }) => {
        const parsedMessage = JSON.parse(data.toString());
        expect(parsedMessage.type).toBe("chat");
        expect(parsedMessage.message).toBe("Hi there");
        resolve();
      };

      ws1.send(JSON.stringify({
        type: "chat",
        roomId: "room-1",
        message: "Hi there"
      }));
    });
  });
});
