const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("client"));
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "voting_system",
});

// Endpoint for registering users
app.post("/register", (req, res) => {
  const { firstName, lastName, address } = req.body;
  // Verify Address and store in DB (Google Maps API integration)
  // After verification, store user info in the database
  const query = "INSERT INTO voters (firstName, lastName) VALUES (?, ?)";
  db.query(query, [firstName, lastName], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ voterId: result.insertId });
  });
});

// Endpoint for submitting votes
app.post("/vote", (req, res) => {
  const { voterId, candidateId } = req.body;
  const query = "INSERT INTO votes (voterId, candidateId) VALUES (?, ?)";
  db.query(query, [voterId, candidateId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Broadcast the updated vote count
    io.emit("vote-cast", { candidateId });
    res.status(200).json({ message: "Vote registered" });
  });
});

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
