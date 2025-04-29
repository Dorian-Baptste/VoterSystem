require("dotenv").config(); // Load .env variables
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");

// --- Model Imports ---
const Voter = require("./models/voterModel");
const Address = require("./models/addressModel");
const Vote = require("./models/voteModel");
const Candidate = require("./models/candidateModel"); // Import new model

// --- Route Imports ---
const userRoutes = require("./routes/userRoutes");
// const voteRoutes = require("./routes/voteRoutes"); // Removed - using Socket.IO

// --- Config Import ---
const config = require("../config/config");

// --- Express App Setup ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // Configure CORS if frontend is on a different origin during development
    origin: "*", // Be more specific in production!
    methods: ["GET", "POST"],
  },
});

// --- Database Connection ---
mongoose
  .connect(config.dbURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Middleware ---
app.use(express.json()); // Parse JSON bodies
app.use(express.static("public")); // Serve static files from 'public'

// --- API Routes ---
app.use("/api/users", userRoutes);
// app.use("/api/votes", voteRoutes); // Removed

// Add a route to get candidates
app.get("/api/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ candidateId: 1 }); // Fetch all candidates
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Error fetching candidates" });
  }
});

// --- Helper Function to Get Vote Counts ---
async function getDatabaseVoteCounts() {
  try {
    const results = await Vote.aggregate([
      { $group: { _id: "$candidateId", count: { $sum: 1 } } },
    ]);
    // console.log("Raw Aggregation Results:", results); // Debugging

    // Fetch all candidates to ensure all have a count, even if 0
    const candidates = await Candidate.find({}, "candidateId"); // Fetch only IDs
    const counts = {};
    candidates.forEach((c) => {
      counts[c.candidateId] = 0; // Initialize all candidate counts to 0
    });

    // Populate counts from aggregation results
    results.forEach((item) => {
      if (item._id !== null && counts.hasOwnProperty(item._id)) {
        // Check if _id is a valid candidateId
        counts[item._id] = item.count;
      } else {
        // console.warn(`Found vote count for unknown or null candidateId: ${item._id}`); // Debugging
      }
    });

    // console.log("Processed Counts:", counts); // Debugging
    return counts;
  } catch (error) {
    console.error("Error getting vote counts from DB:", error);
    return {}; // Return empty object on error
  }
}

// --- Socket.IO Logic ---
io.on("connection", async (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Send initial vote counts on connection
  const initialCounts = await getDatabaseVoteCounts();
  socket.emit("voteCounts", initialCounts);

  // Handler to explicitly get initial counts if needed by client
  socket.on("getInitialCounts", async () => {
    const counts = await getDatabaseVoteCounts();
    socket.emit("voteCounts", counts);
  });

  // Handle vote submission
  socket.on("submitVote", async (voteData) => {
    console.log(`Vote received from ${socket.id}:`, voteData);
    const { candidateId, voterId } = voteData;

    // ** Basic Validation **
    // In a real app: verify voter hasn't voted, voterId is valid, candidateId is valid etc.
    if (!voterId || !candidateId) {
      console.error("Invalid vote data received:", voteData);
      // Send status back to the specific client
      socket.emit("voteStatus", {
        success: false,
        message: "Invalid vote data provided.",
      });
      return;
    }

    try {
      // Check if voter exists (optional but good practice)
      const voter = await Voter.findById(voterId);
      if (!voter) {
        socket.emit("voteStatus", {
          success: false,
          message: "Voter not found.",
        });
        return;
      }

      // Check if candidate exists (optional but good practice)
      // Using candidateId (Number) - adjust if using _id
      const candidate = await Candidate.findOne({
        candidateId: Number(candidateId),
      });
      if (!candidate) {
        socket.emit("voteStatus", {
          success: false,
          message: "Candidate not found.",
        });
        return;
      }

      // ** Check if voter has already voted (CRITICAL) **
      const existingVote = await Vote.findOne({ voterId: voterId });
      if (existingVote) {
        console.log(`Voter ${voterId} has already voted.`);
        socket.emit("voteStatus", {
          success: false,
          message: "You have already cast your vote.",
        });
        return; // Stop processing
      }

      // Save the vote to the database
      const newVote = new Vote({
        voterId: voterId,
        // Ensure candidateId is stored as the correct type expected by the schema (Number)
        candidateId: Number(candidateId),
        // dateTime defaults to Date.now in schema
      });
      await newVote.save();
      console.log(`Vote saved for voter ${voterId}, candidate ${candidateId}`);

      // Send success status back to the client
      socket.emit("voteStatus", { success: true });

      // Get updated counts from the database
      const updatedCounts = await getDatabaseVoteCounts();

      // Emit updated vote counts to ALL connected clients
      io.emit("voteCounts", updatedCounts);
    } catch (error) {
      console.error("Error processing vote:", error);
      // Send error status back to the client
      socket.emit("voteStatus", {
        success: false,
        message: "Error saving your vote.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- Start Server ---
// Use environment variable for port or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Ensure GOOGLE_MAPS_API_KEY is loaded
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn(
      "WARNING: GOOGLE_MAPS_API_KEY environment variable is not set. Address verification will fail."
    );
  }
  // Ensure dbURI is being used (it's read in the mongoose.connect call)
  console.log(`Attempting to connect to MongoDB at ${config.dbURI}`);
});

// Add basic error handling for unhandled promise rejections or uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  // It is generally recommended to gracefully shutdown the server here
  process.exit(1);
});
