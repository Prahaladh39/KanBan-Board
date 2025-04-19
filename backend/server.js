const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"],
  },
});
// In-memory tasks store
let tasks = [];

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send current tasks to new client
  socket.emit("tasks:update", tasks); // FIXED!

  // Create task
  socket.on("task:create", (task) => {
    tasks.push(task);
    io.emit("tasks:update", tasks); // FIXED!
  });

  // Update task
  socket.on("task:update", (updatedTask) => {
    tasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    io.emit("tasks:update", tasks);
  });

  // Move task
  socket.on("task:move", ({ id, newColumn }) => {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, status: newColumn } : task
    );
    io.emit("tasks:update", tasks);
  });

  // Delete task
  socket.on("task:delete", (id) => {
    tasks = tasks.filter((task) => task.id !== id);
    io.emit("tasks:update", tasks);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
