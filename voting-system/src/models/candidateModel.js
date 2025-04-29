const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  candidateId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    enum: ["Party A", "Party B"],
    required: true,
  },
  // --- ADD THIS FIELD ---
  imageUrl: {
    type: String, // Store the URL of the candidate's image
    required: false, // Make it optional if some candidates might not have images
  },
  // --- END ADDITION ---
});

module.exports = mongoose.model("Candidate", candidateSchema);
