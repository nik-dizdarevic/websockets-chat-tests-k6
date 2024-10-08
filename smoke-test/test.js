import { randomString, randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { WebSocket } from "k6/experimental/websockets";
import { setTimeout, clearTimeout, setInterval, clearInterval } from "k6/timers";
import { Counter } from 'k6/metrics';

const txtSentCounter = new Counter('ws_msgs_sent_txt');

export default function () {
    for (let i = 0; i < 10; i++) {
        startWSWorker(i);
    }
}

function startWSWorker(id) {
    const sessionDuration = randomIntBetween(10000, 60000); // user session between 10s and 1m
    let ws = new WebSocket(`ws://127.0.0.1:7878`);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
        console.log(`VU ${__VU}:${id} connected`);

        ws.onmessage = event => {
            const message = event.data
            console.log(`VU ${__VU}:${id} received: ${message}`);
        }

        let intervalId = setInterval(() => {
            const message = `I'm saying ${randomString(5)}`;
            ws.send(message);
            txtSentCounter.add(1);
            console.log((`VU ${__VU}:${id} sent: ${message}`));
        }, randomIntBetween(2000, 8000)); // say something every 2-8seconds

        const timeout1id = setTimeout(function () {
            clearInterval(intervalId);
            console.log(`VU ${__VU}:${id}: ${sessionDuration}ms passed, leaving the chat`);
            ws.close();
        }, sessionDuration);

        ws.onclose = () => {
            clearTimeout(timeout1id);
            console.log(`VU ${__VU}:${id}: disconnected`);
        }

        ws.onping = () => {
            console.log('PING!');
        }

        ws.onpong = () => {
            console.log('PONG!');
        }

        ws.onerror = (e) => {
            console.log(e);
        }
    }
}