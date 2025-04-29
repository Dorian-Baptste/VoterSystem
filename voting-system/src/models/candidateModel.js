const mongoose = require("mongoose");

// Define candidate schema based on requirements
const candidateSchema = new mongoose.Schema({
  // Using Number for candidateId to match frontend expectations,
  // but could also use default _id or String. Ensure uniqueness.
  candidateId: {
    type: Number,
    required: true,
    unique: true, // Assuming candidateId like 1, 2, 3, 4 is the unique identifier
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
    enum: ["Party A", "Party B"], // Use enum as specified
    required: true,
  },
});

// Add a compound index for potential lookups if needed
// candidateSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
