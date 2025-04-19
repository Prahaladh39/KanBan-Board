import { io } from "socket.io-client";

// ⚠️ Update the URL to your backend server if needed
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
