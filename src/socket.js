import { io } from "socket.io-client";
const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Connect to your backend Socket.IO server
export const socket = io(BACKEND, { transports: ['websocket'] });
