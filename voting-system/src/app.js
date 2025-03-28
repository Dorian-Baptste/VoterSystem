const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const voteRoutes = require("./routes/voteRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/votes", voteRoutes);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle vote submission
  socket.on("submitVote", (voteData) => {
    // Emit new vote counts to all connected clients
    io.emit("voteCounts", voteData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
