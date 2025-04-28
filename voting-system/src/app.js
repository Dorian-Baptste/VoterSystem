const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const voteRoutes = require("./routes/voteRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// In-memory vote counts (ideally, you'd persist this in a database)
let voteCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

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
    const candidateId = voteData.candidateId;

    // Update the vote count for the selected candidate
    if (voteCounts[candidateId] !== undefined) {
      voteCounts[candidateId]++;
      console.log(
        `Vote received for candidate ${candidateId}. Total votes: ${voteCounts[candidateId]}`
      );
    }

    // Emit updated vote counts to all connected clients
    io.emit("voteCounts", voteCounts);
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
