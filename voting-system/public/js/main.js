const socket = io(); // Initialize the Socket.IO connection

// --- State Variable ---
let currentVoterId = null;
let map = null;
let marker = null;
let isCandidateStructureBuilt = false;

// --- DOM Elements ---
const registerForm = document.getElementById("registerForm");
const registrationSection = document.getElementById("registrationSection");
const registrationMessage = document.getElementById("registrationMessage");
const mapContainer = document.getElementById("mapContainer");
const mapDiv = document.getElementById("map");

const votingSection = document.getElementById("votingSection");
const voteForm = document.getElementById("voteForm");
const candidateListDiv = document.getElementById("candidateList");
const voteMessage = document.getElementById("voteMessage");
const welcomeVoterP = document.getElementById("welcomeVoter");

// Removed resultsSection and voteResultsList references

const registerAgainButton = document.getElementById("registerAgainButton");
const candidateInfoListDiv = document.getElementById("candidateInfoList");

// --- Functions ---

// Initialize Leaflet Map
function initializeMap(lat, lng, addressString) {
  if (map) {
    map.setView([lat, lng], 15);
  } else {
    map = L.map(mapDiv, {}).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.getContainer().setAttribute("role", "application");
  }
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], {
      keyboard: true,
      alt: `Location marker for ${addressString}`,
    }).addTo(map);
  }
  marker.bindPopup(`<b>Verified Location:</b><br>${addressString}`).openPopup();
  mapContainer.style.display = "block";
}

// Populate Candidate Info Display Area (Top Section) - NOW CLICKABLE
function displayCandidateInfo(candidates) {
  console.log("Populating clickable candidate info display area...");
  if (!candidateInfoListDiv) {
    return;
  }
  candidateInfoListDiv.innerHTML = "";

  if (candidates.length === 0) {
    candidateInfoListDiv.innerHTML =
      '<p class="text-center text-muted">No candidates to display.</p>';
    return;
  }

  candidates.forEach((candidate) => {
    const candidateIdentifier = candidate.candidateId || candidate._id;

    const col = document.createElement("div");
    col.className = "col-6 col-md-3";
    const card = document.createElement("div");
    card.className = "candidate-display-card"; // Base class
    card.dataset.candidateId = candidateIdentifier; // Store candidate ID on the card

    const img = document.createElement("img");
    img.src =
      candidate.imageUrl ||
      "https://via.placeholder.com/80/CCC/888?text=No+Image";
    img.alt = `Photo of ${candidate.firstName} ${candidate.lastName || ""}`;
    img.className = "img-fluid";

    const namePara = document.createElement("p");
    namePara.className = "mb-0 fw-bold";
    namePara.textContent = `${candidate.firstName} ${candidate.lastName || ""}`;

    const partyPara = document.createElement("p");
    partyPara.className = "mb-0 small text-muted";
    partyPara.textContent = `(${candidate.party})`;

    const countPara = document.createElement("p");
    countPara.className = "vote-count mt-1"; // Initially hidden by CSS
    const countSpan = document.createElement("span");
    countSpan.id = `card-votes-${candidateIdentifier}`;
    countSpan.textContent = "0";
    countSpan.className = "fw-bold";
    countPara.textContent = "Votes: ";
    countPara.appendChild(countSpan);

    card.appendChild(img);
    card.appendChild(namePara);
    card.appendChild(partyPara);
    card.appendChild(countPara);
    col.appendChild(card);
    candidateInfoListDiv.appendChild(col);

    // --- ADD CLICK LISTENER TO THE CARD ---
    card.addEventListener("click", () => {
      // Only allow clicking if registered and vote form isn't disabled
      if (
        currentVoterId &&
        !voteForm.querySelector('button[type="submit"]').disabled
      ) {
        const clickedCandidateId = card.dataset.candidateId;
        console.log(`Candidate card clicked: ID ${clickedCandidateId}`);

        // Find the corresponding radio button in the voting form
        const radioBtn = voteForm.querySelector(
          `input[name="candidate"][value="${clickedCandidateId}"]`
        );

        if (radioBtn) {
          radioBtn.checked = true; // Check the radio button

          // Remove selection class from all cards
          candidateInfoListDiv
            .querySelectorAll(".candidate-display-card")
            .forEach((c) => {
              c.classList.remove("selected-for-vote");
            });
          // Add selection class to the clicked card
          card.classList.add("selected-for-vote");

          console.log(
            `Radio button for candidate ${clickedCandidateId} checked.`
          );
        } else {
          console.warn(
            `Could not find radio button for candidate ID ${clickedCandidateId}`
          );
        }
      } else {
        if (!currentVoterId) {
          console.log("Card clicked, but user not registered yet.");
          // Optionally provide feedback e.g., alert("Please register before selecting a candidate.");
        } else {
          console.log(
            "Card clicked, but voting is already complete for this session."
          );
        }
      }
    });
    // --- END CLICK LISTENER ---
  });
  hideAllVoteCounts(); // Ensure counts are hidden initially
}

// Fetch Candidates and Populate Displays
async function fetchAndDisplayCandidates() {
  console.log("Running fetchAndDisplayCandidates...");
  isCandidateStructureBuilt = false;
  candidateListDiv.innerHTML = "<p>Loading candidates...</p>";
  candidateInfoListDiv.innerHTML =
    '<p class="text-center">Loading candidates...</p>';

  try {
    console.log("FETCH: Fetching candidates from /api/candidates...");
    const response = await fetch("/api/candidates");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const candidates = await response.json();
    console.log("FETCH: Candidates received:", candidates);

    // Populate Candidate Info Display (makes cards clickable)
    displayCandidateInfo(candidates);

    // Populate Candidate Voting List (Radio Buttons)
    candidateListDiv.innerHTML = "";
    if (candidates.length === 0) {
      console.log("FETCH: No candidates found for voting form.");
      candidateListDiv.innerHTML =
        '<p class="text-warning">No candidates found.</p>';
      isCandidateStructureBuilt = false;
      return;
    }
    candidates.forEach((candidate) => {
      const label = document.createElement("label");
      label.className = "form-check";
      const candidateIdentifier = candidate.candidateId || candidate._id;
      label.innerHTML = `<input class="form-check-input" type="radio" name="candidate" value="${candidateIdentifier}" required> <span class="form-check-label"> ${
        candidate.firstName
      } ${candidate.lastName || ""} (${candidate.party}) </span>`;
      candidateListDiv.appendChild(label);
    });

    console.log("FETCH: Setting isCandidateStructureBuilt = true");
    isCandidateStructureBuilt = true;
    console.log("FETCH: Emitting getInitialCounts.");
    socket.emit("getInitialCounts");
  } catch (error) {
    console.error("FETCH: Error fetching or displaying candidates:", error);
    candidateListDiv.innerHTML =
      '<p class="text-danger">Could not load candidates.</p>';
    candidateInfoListDiv.innerHTML =
      '<p class="text-center text-danger">Error loading candidates.</p>';
    isCandidateStructureBuilt = false;
  }
}

// Helper Functions for Visibility
function showAllVoteCounts() {
  const countElements = candidateInfoListDiv.querySelectorAll(".vote-count");
  console.log(`Showing ${countElements.length} vote count elements.`);
  countElements.forEach((el) => {
    el.style.display = "block";
  });
}

function hideAllVoteCounts() {
  const countElements = candidateInfoListDiv.querySelectorAll(".vote-count");
  console.log(`Hiding ${countElements.length} vote count elements.`);
  countElements.forEach((el) => {
    el.style.display = "none";
  });
}

// Function to reset the UI back to the registration state
function resetToRegisterState() {
  console.log("RESET: Resetting UI to registration state.");
  votingSection.style.display = "none";
  mapContainer.style.display = "none";
  registerAgainButton.classList.add("d-none");
  registrationSection.style.display = "block";
  hideAllVoteCounts(); // Hide counts on reset

  // --- Remove visual selection from candidate cards ---
  candidateInfoListDiv
    .querySelectorAll(".candidate-display-card")
    .forEach((c) => {
      c.classList.remove("selected-for-vote");
    });
  // --- End change ---

  registrationMessage.textContent = "";
  registrationMessage.className = "";
  voteMessage.textContent = "";
  voteMessage.className = "";
  registerForm.reset();
  voteForm.reset();
  voteForm
    .querySelectorAll("input, button")
    .forEach((el) => (el.disabled = false));
  currentVoterId = null;

  candidateListDiv.innerHTML = "<p>Loading candidates...</p>";
  isCandidateStructureBuilt = false;

  // Re-fetch candidates to reset displays correctly
  console.log("RESET: Triggering fetchAndDisplayCandidates after reset.");
  fetchAndDisplayCandidates();

  console.log("RESET: UI Reset complete. Waiting for next registration.");
}

// --- Event Listeners ---

// Handle Registration Form Submission
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Registration form submitted.");
  registrationMessage.textContent = "Registering and verifying address...";
  mapContainer.style.display = "none";
  hideAllVoteCounts(); // Ensure counts are hidden

  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (response.ok) {
      console.log("Registration successful:", result);
      currentVoterId = result.userId;
      registrationMessage.textContent = `Registration successful! Welcome ${data.firstName}. Your Voter ID: ${currentVoterId}`;
      registrationMessage.className = "alert alert-success";

      if (result.latitude && result.longitude) {
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`;
        initializeMap(result.latitude, result.longitude, fullAddress);
      } else {
        console.warn("Geolocation data missing in registration response.");
        mapContainer.style.display = "none";
      }

      welcomeVoterP.textContent = `Welcome, ${data.firstName}! Please cast your vote.`;
      votingSection.style.display = "block"; // Show voting section
      registrationSection.style.display = "none"; // Hide registration form

      // Ensure latest counts are shown in the top display (already built)
      if (isCandidateStructureBuilt) {
        console.log(
          "Registration success: Requesting counts for background update..."
        );
        socket.emit("getInitialCounts");
      }
    } else {
      console.error("Registration failed response:", result);
      registrationMessage.textContent = `Registration failed: ${
        result.message || "Unknown error"
      }`;
      registrationMessage.className = "alert alert-danger";
      currentVoterId = null;
      votingSection.style.display = "none";
      hideAllVoteCounts();
    }
  } catch (error) {
    console.error("Registration error:", error);
    registrationMessage.textContent = "An error occurred during registration.";
    registrationMessage.className = "alert alert-danger";
    currentVoterId = null;
    votingSection.style.display = "none";
    hideAllVoteCounts();
  }
});

// Handle Vote Form Submission
voteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  voteMessage.textContent = "";
  const selectedCandidateInput = document.querySelector(
    'input[name="candidate"]:checked'
  );
  if (!currentVoterId) {
    voteMessage.textContent =
      "Error: Voter ID not found. Please register first.";
    voteMessage.className = "alert alert-danger";
    return;
  }
  if (selectedCandidateInput) {
    const voteData = {
      candidateId: selectedCandidateInput.value,
      voterId: currentVoterId,
    };
    console.log("Emitting submitVote:", voteData);
    socket.emit("submitVote", voteData);
    voteMessage.textContent = "Submitting your vote...";
    voteMessage.className = "alert alert-info";
  } else {
    voteMessage.textContent = "Please select a candidate before submitting.";
    voteMessage.className = "alert alert-warning";
  }
});

// Event listener for the 'Register Another Voter' button
registerAgainButton.addEventListener("click", () => {
  resetToRegisterState();
});

// --- Socket.IO Event Handlers ---

socket.on("connect", () => {
  console.log("SOCKET: Connected to Socket.IO server");
  fetchAndDisplayCandidates();
});

// Update counts in the background
socket.on("voteCounts", (voteCounts) => {
  console.log("SOCKET: Received voteCounts event with:", voteCounts);
  if (!isCandidateStructureBuilt) {
    console.warn(
      "SOCKET: Candidate structure not built yet. Ignoring background count update."
    );
    return;
  }
  console.log(
    "SOCKET: Updating background counts in candidate cards:",
    voteCounts
  );
  for (const candidateId in voteCounts) {
    const countSpan = document.getElementById(`card-votes-${candidateId}`);
    if (countSpan) {
      countSpan.textContent = voteCounts[candidateId];
    } else {
      console.warn(
        `SOCKET: Count span #card-votes-${candidateId} not found during background update.`
      );
    }
  }
});

// Handle vote success/failure
socket.on("voteStatus", (data) => {
  if (data.success) {
    console.log("Vote successfully recorded by server.");
    voteMessage.textContent = "Vote successfully recorded!";
    voteMessage.className = "alert alert-success";
    voteForm
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = true));
    registerAgainButton.classList.remove("d-none");
    showAllVoteCounts(); // Show counts integrated into cards
    // Remove selection highlight after successful vote
    candidateInfoListDiv
      .querySelectorAll(".candidate-display-card")
      .forEach((c) => {
        c.classList.remove("selected-for-vote");
        c.style.cursor = "default"; // Make non-clickable after vote
      });
  } else {
    console.error("Vote submission failed:", data.message);
    voteMessage.textContent = `Vote submission failed: ${data.message}`;
    voteMessage.className = "alert alert-danger";
    voteForm
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = false));
    registerAgainButton.classList.add("d-none");
    hideAllVoteCounts(); // Ensure counts remain hidden if vote fails
  }
});

socket.on("disconnect", () => {
  console.log("SOCKET: Disconnected from Socket.IO server");
});

// --- Initial Load ---
votingSection.style.display = "none";
mapContainer.style.display = "none";
registrationSection.style.display = "block";
isCandidateStructureBuilt = false;
console.log(
  "Initial Load: UI set, Candidate counts hidden, isCandidateStructureBuilt=false"
);
