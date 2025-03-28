const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

module.exports = mongoose.model("Voter", voterSchema);
