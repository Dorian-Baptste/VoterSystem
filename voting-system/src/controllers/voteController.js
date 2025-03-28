const Vote = require("../models/voteModel");

// Submit a vote
exports.submitVote = async (req, res) => {
  const { voterId, candidateId } = req.body;

  try {
    const newVote = new Vote({ voterId, candidateId });
    await newVote.save();

    res.status(200).json({ message: "Vote submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error submitting vote", error });
  }
};
