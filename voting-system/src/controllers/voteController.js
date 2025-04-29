// const Vote = require("../models/voteModel"); // No longer needed here

// // Submit a vote - THIS IS LARGELY OBSOLETE as logic moved to Socket.IO in app.js
// exports.submitVote = async (req, res) => {
//   // This route is likely no longer used by the frontend.
//   // If kept, it would need significant updates (validation, triggering Socket.IO)
//   // For now, returning a message indicating it's deprecated/inactive.
//    console.warn("Received request to deprecated /api/votes/submit endpoint.");
//    res.status(404).json({ message: "Voting is handled via real-time connection. This endpoint is inactive." });

//   // Original code (commented out):
//   // const { voterId, candidateId } = req.body;
//   // try {
//   //   const newVote = new Vote({ voterId, candidateId });
//   //   await newVote.save();
//   //   res.status(200).json({ message: "Vote submitted successfully" });
//   // } catch (error) {
//   //   res.status(400).json({ message: "Error submitting vote", error });
//   // }
// };

// You might add functions here later for GETTING vote results via API if needed
// e.g., exports.getVoteResults = async (req, res) => { ... }
