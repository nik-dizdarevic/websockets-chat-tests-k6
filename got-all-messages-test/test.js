import { randomString, randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { WebSocket } from "k6/experimental/websockets";
import { setTimeout, clearTimeout, setInterval, clearInterval } from "k6/timers";
import { Counter, Trend } from 'k6/metrics';

const sessionDuration = 60000;
const txtSentCounter = new Counter('ws_msgs_sent_txt');
const messageLatency = new Trend('ws_msgs_latency', true);
const disconnectLatency = new Trend('ws_dcn_latency', true);

export const options = {
    vus: 512,
    iterations: 512,
};

export default function () {
    let ws = new WebSocket(`ws://127.0.0.1:7878`);
    ws.binaryType = "arraybuffer";
    let closeInitiated = 0;

    ws.onopen = () => {
        ws.onmessage = event => {
            const receivedAt = Date.now();
            const message = JSON.parse(event.data);
            messageLatency.add(receivedAt - message.time);
        }

        let intervalId = setInterval(() => {
            ws.send(JSON.stringify({text: `I'm saying ${randomString(5)}`, time: Date.now()}));
            txtSentCounter.add(1);
        }, 5000); // one message every 5 seconds

        const timeout1id = setTimeout(function () {
            closeInitiated = Date.now();
            ws.close();
        }, sessionDuration);

        const timeout2id = setTimeout(function () {
            clearInterval(intervalId);
        }, sessionDuration - 5000);

        ws.onclose = () => {
            disconnectLatency.add(Date.now() - closeInitiated);
            clearTimeout(timeout1id);
            clearTimeout(timeout2id)
        }

        ws.onping = () => {
            console.log('PING!');
        }

        ws.onpong = () => {
            console.log('PONG!');
        }

        ws.onerror = (e) => {
            console.error(e);
        }
    }
}