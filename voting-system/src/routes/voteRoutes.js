const express = require("express");
// const voteController = require("../controllers/voteController"); // Controller mostly obsolete

const router = express.Router();

// Submit a vote - Endpoint is likely obsolete, handled by Socket.IO now
// router.post("/submit", voteController.submitVote);
router.post("/submit", (req, res) => {
  res
    .status(404)
    .json({
      message:
        "Voting is handled via real-time connection. This endpoint is inactive.",
    });
});

// You might add routes here later for GETTING vote results via API if needed
// e.g., router.get("/results", voteController.getVoteResults);

module.exports = router;
