import WebSocket from 'ws';
const ws = new WebSocket('wss://ais-dev-e65pkpyym5zzqgyy3zvq6i-487774199243.asia-southeast1.run.app/ws/transcribe');
ws.on('open', () => { console.log('Connected remote!'); ws.close(); });
ws.on('error', (err) => console.error('Remote Error:', err));
