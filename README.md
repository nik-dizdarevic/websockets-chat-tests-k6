**Smoke test**: 10 virtual users connect to a WebSocket server, send messages at random intervals, and disconnect after a random session duration.

**Got all messages test**: 512 virtual users connect to a WebSocket server, sending messages every 5 seconds and disconnecting after 60 seconds.

**Load test**: The number of VUs ramps up to 256/512 over 1 minute, holds for 2 minutes, then ramps down to 0 over the final minute. Users connect, send messages, and disconnect.

