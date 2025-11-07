import { io } from "socket.io-client";

// Connect to backend
export const socket = io("http://localhost:5000"); // Replace with your backend URL
