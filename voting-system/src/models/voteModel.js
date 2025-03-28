const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "Voter" },
  candidateId: { type: Number, required: true },
  dateTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vote", voteSchema);
