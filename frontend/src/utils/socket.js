import { io } from "socket.io-client";

// ⚠️ Update the URL to your backend server if needed
const socket = io("https://kanbanback-dcd7.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
