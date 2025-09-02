import { resolve } from 'bun';
import {test, describe, expect} from 'bun:test';

const BACKEND_URL1 = 'ws://localhost:8080';
const BACKEND_URL2 = 'ws://localhost:8081';

describe("Chat Application", () => {
    test("Message sent from 8080 -> 8081", async () => {
        
        const ws1 = new WebSocket(BACKEND_URL1);
        const ws2 = new WebSocket(BACKEND_URL2);

        await new Promise<void>((resolve, reject) => {
            let count = 1;
            ws1.onopen = () => {
                count++;
            }
            ws2.onopen = () => {
                count++;
            }
            if (count == 2) resolve();
        })

        ws1.send(JSON.stringify({
            type: "join-room",
            roomId: "room-1"
        }))
        ws2.send(JSON.stringify({
            type: "join-room",
            roomId: "room-1"
        }))
        
        await new Promise<void>((resolve, reject) => {
            ws2.onmessage = ({data}) => {
                const parsedMessage = JSON.parse(data);
                expect(parsedMessage.type === "chat");
                expect(parsedMessage.message === "Hi there")
                resolve()
            }
        
            ws1.send(JSON.stringify({
                type: "chat",
                message: "Hi there"
            }))
        })

    })
})