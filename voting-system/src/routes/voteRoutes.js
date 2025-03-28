const express = require("express");
const voteController = require("../controllers/voteController");

const router = express.Router();

// Submit a vote
router.post("/submit", voteController.submitVote);

module.exports = router;
