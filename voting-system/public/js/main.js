const socket = io(); // Initialize the Socket.IO connection

// Handle vote submission
document.getElementById("voteForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedCandidate = document.querySelector(
    'input[name="candidate"]:checked'
  );

  if (selectedCandidate) {
    const voteData = {
      candidateId: selectedCandidate.value,
    };

    // Send the vote to the server
    socket.emit("submitVote", voteData);

    // Optional: Disable the vote form after submitting
    document.getElementById("voteForm").reset(); // Clear form
    alert("Your vote has been submitted!"); // Show confirmation
  } else {
    alert("Please select a candidate before submitting your vote.");
  }
});

// Listen for vote count updates from the server
socket.on("voteCounts", (voteCounts) => {
  console.log("Updated vote counts:", voteCounts); // Check the vote counts

  document.getElementById("voteA1").textContent = voteCounts[1];
  document.getElementById("voteA2").textContent = voteCounts[2];
  document.getElementById("voteB1").textContent = voteCounts[3];
  document.getElementById("voteB2").textContent = voteCounts[4];
});
