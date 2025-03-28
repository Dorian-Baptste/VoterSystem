const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "Voter" },
});

module.exports = mongoose.model("Address", addressSchema);
