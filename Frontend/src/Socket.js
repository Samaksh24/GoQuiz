import {io} from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
  withCredentials: true})

  socket.on('connect_error', (err) => console.error('Socket connect_error:', err.message));

  export default socket;