import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:8080';

const socket = io(SOCKET_SERVER_URL, {
  transports: ['websocket'],
  autoConnect: false, 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;