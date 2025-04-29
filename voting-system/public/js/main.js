const socket = io(); // Initialize the Socket.IO connection

// --- State Variable ---
let currentVoterId = null; // Store voter ID after registration
let map = null; // Leaflet map instance
let marker = null; // Leaflet marker instance
// --- Flag to check if initial structure is built ---
let isResultsStructureBuilt = false;

// --- DOM Elements ---
const registerForm = document.getElementById("registerForm");
const registrationSection = document.getElementById("registrationSection"); // Get reference
const registrationMessage = document.getElementById("registrationMessage");
const mapContainer = document.getElementById("mapContainer");
const mapDiv = document.getElementById("map");

const votingSection = document.getElementById("votingSection");
const voteForm = document.getElementById("voteForm");
const candidateListDiv = document.getElementById("candidateList");
const voteMessage = document.getElementById("voteMessage");
const welcomeVoterP = document.getElementById("welcomeVoter");

const resultsSection = document.getElementById("resultsSection"); // Get reference for visibility
const voteResultsList = document.getElementById("voteResultsList");

const registerAgainButton = document.getElementById("registerAgainButton");

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

// Fetch Candidates and Populate Form AND Results Structure
async function fetchAndDisplayCandidates() {
  console.log("Running fetchAndDisplayCandidates..."); // Log fetch start
  isResultsStructureBuilt = false;
  candidateListDiv.innerHTML = "<p>Loading candidates...</p>";
  // Results list content is reset here, but visibility is handled elsewhere
  voteResultsList.innerHTML = "<li>Loading results...</li>";

  try {
    console.log("FETCH: Fetching candidates from /api/candidates...");
    const response = await fetch("/api/candidates");
    if (!response.ok) {
      console.error(`FETCH: HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const candidates = await response.json();
    console.log("FETCH: Candidates received:", candidates);

    // --- Populate Candidate Voting List ---
    candidateListDiv.innerHTML = ""; // Clear loading message
    if (candidates.length === 0) {
      console.log("FETCH: No candidates found in response.");
      candidateListDiv.innerHTML =
        '<p class="text-warning">No candidates found.</p>';
      voteResultsList.innerHTML = "<li>No candidates found.</li>";
      isResultsStructureBuilt = false;
      return;
    }

    candidates.forEach((candidate) => {
      const label = document.createElement("label");
      label.className = "form-check";
      const candidateIdentifier = candidate.candidateId || candidate._id;
      label.innerHTML = `
                <input class="form-check-input" type="radio" name="candidate" value="${candidateIdentifier}" required>
                <span class="form-check-label">
                    ${candidate.firstName} ${candidate.lastName || ""} (${
        candidate.party
      })
                </span>
            `;
      candidateListDiv.appendChild(label);
    });

    // --- Build the initial results display structure ---
    console.log("FETCH: Building initial results structure...");
    updateVoteResultsDisplay(null, candidates);

    // --- Set Flag and Request Counts (ONLY AFTER structure is built) ---
    console.log("FETCH: Setting isResultsStructureBuilt = true");
    isResultsStructureBuilt = true;
    console.log("FETCH: Emitting getInitialCounts.");
    socket.emit("getInitialCounts");
  } catch (error) {
    console.error("FETCH: Error fetching or displaying candidates:", error);
    candidateListDiv.innerHTML =
      '<p class="text-danger">Could not load candidates.</p>';
    voteResultsList.innerHTML = "<li>Error loading candidate results.</li>";
    isResultsStructureBuilt = false;
  }
}

// Update Vote Results Display Structure or Counts
function updateVoteResultsDisplay(voteCounts, candidates = []) {
  // Build initial structure
  if (voteCounts === null) {
    voteResultsList.innerHTML = "";
    if (candidates.length === 0) {
      voteResultsList.innerHTML =
        "<li>No candidates available to display results.</li>";
      return;
    }
    console.log("UPDATE_DISPLAY: Building initial structure for results list.");
    candidates.forEach((candidate) => {
      const candidateIdentifier = candidate.candidateId || candidate._id;
      const li = document.createElement("li");
      const nameSpan = document.createElement("span");
      nameSpan.textContent = `${candidate.firstName} ${
        candidate.lastName || ""
      }: `;
      const countSpan = document.createElement("span");
      countSpan.id = `votes-${candidateIdentifier}`;
      countSpan.textContent = "0";
      li.appendChild(nameSpan);
      li.appendChild(countSpan);
      voteResultsList.appendChild(li);
    });
    // Don't set flag here, let caller do it
  }
  // Update counts using received data
  else {
    console.log("UPDATE_DISPLAY: Received voteCounts event with:", voteCounts);
    // If the structure isn't ready when counts arrive, we might miss the first update
    // but subsequent updates (after voting) will work. The structure should be ready
    // because we now wait for it before emitting getInitialCounts.
    if (!isResultsStructureBuilt) {
      console.warn(
        "UPDATE_DISPLAY: isResultsStructureBuilt is FALSE. Ignoring update."
      );
      return;
    }

    console.log("UPDATE_DISPLAY: Updating counts with data:", voteCounts);
    // No need to explicitly show results section here, visibility handled elsewhere

    for (const candidateId in voteCounts) {
      const countSpan = document.getElementById(`votes-${candidateId}`);
      if (countSpan) {
        countSpan.textContent = voteCounts[candidateId];
      } else {
        console.warn(
          `UPDATE_DISPLAY: Count span for candidate ID ${candidateId} not found during update.`
        );
      }
    }
  }
}

// Function to reset the UI back to the registration state
function resetToRegisterState() {
  console.log("RESET: Resetting UI to registration state.");
  votingSection.style.display = "none";
  mapContainer.style.display = "none";
  registerAgainButton.classList.add("d-none");
  registrationSection.style.display = "block";
  resultsSection.classList.add("d-none"); // Hide results section on reset

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

  // Reset displays and flag
  candidateListDiv.innerHTML = "<p>Loading candidates...</p>";
  voteResultsList.innerHTML = "<li>Loading results...</li>"; // Reset results text
  isResultsStructureBuilt = false; // Reset flag

  // Trigger fetching candidates again for the next session's structure build
  console.log("RESET: Triggering fetchAndDisplayCandidates after reset.");
  fetchAndDisplayCandidates();
}

// --- Event Listeners ---

// Handle Registration Form Submission
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Registration form submitted.");
  registrationMessage.textContent = "Registering and verifying address...";
  mapContainer.style.display = "none";
  resultsSection.classList.add("d-none"); // Ensure results are hidden

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
      votingSection.style.display = "block";
      // --- CHANGE: DO NOT SHOW RESULTS SECTION HERE ---
      // resultsSection.classList.remove("d-none"); // REMOVED

      // Fetch candidates to populate the voting form
      await fetchAndDisplayCandidates();

      registrationSection.style.display = "none";
    } else {
      console.error("Registration failed response:", result);
      registrationMessage.textContent = `Registration failed: ${
        result.message || "Unknown error"
      }`;
      registrationMessage.className = "alert alert-danger";
      currentVoterId = null;
      votingSection.style.display = "none";
      resultsSection.classList.add("d-none");
    }
  } catch (error) {
    console.error("Registration error:", error);
    registrationMessage.textContent = "An error occurred during registration.";
    registrationMessage.className = "alert alert-danger";
    currentVoterId = null;
    votingSection.style.display = "none";
    resultsSection.classList.add("d-none");
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
  // Fetch candidates immediately on connect to build UI structure early.
  // This also builds the results structure but results section remains hidden.
  fetchAndDisplayCandidates();
});

socket.on("voteCounts", (voteCounts) => {
  console.log("SOCKET: Received voteCounts event with:", voteCounts);
  // Update the counts in the hidden results section.
  // It will become visible only after a successful vote.
  updateVoteResultsDisplay(voteCounts);
});

socket.on("voteStatus", (data) => {
  if (data.success) {
    console.log("Vote successfully recorded by server.");
    voteMessage.textContent = "Vote successfully recorded!";
    voteMessage.className = "alert alert-success";
    voteForm
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = true));
    registerAgainButton.classList.remove("d-none");

    // --- CHANGE: SHOW RESULTS SECTION ONLY ON VOTE SUCCESS ---
    resultsSection.classList.remove("d-none");
    // --- END CHANGE ---
  } else {
    console.error("Vote submission failed:", data.message);
    voteMessage.textContent = `Vote submission failed: ${data.message}`;
    voteMessage.className = "alert alert-danger";
    voteForm
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = false));
    registerAgainButton.classList.add("d-none");
    // Keep results hidden if vote fails
    resultsSection.classList.add("d-none");
  }
});

socket.on("disconnect", () => {
  console.log("SOCKET: Disconnected from Socket.IO server");
  if (!resultsSection.classList.contains("d-none")) {
    voteResultsList.innerHTML =
      "<li>Disconnected. Vote counts may be outdated.</li>";
  }
});

// --- Initial Load ---
votingSection.style.display = "none";
mapContainer.style.display = "none";
registrationSection.style.display = "block";
// Results section starts hidden via HTML class 'd-none'
isResultsStructureBuilt = false;
console.log(
  "Initial Load: UI set, Results hidden, isResultsStructureBuilt=false"
);
