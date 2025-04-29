const socket = io(); // Initialize the Socket.IO connection

// --- State Variable ---
let currentVoterId = null;
let map = null;
let marker = null;
let isResultsStructureBuilt = false;

// --- DOM Elements ---
const registerForm = document.getElementById("registerForm");
const registrationSection = document.getElementById("registrationSection");
const registrationMessage = document.getElementById("registrationMessage");
const mapContainer = document.getElementById("mapContainer");
const mapDiv = document.getElementById("map");

const votingSection = document.getElementById("votingSection");
const voteForm = document.getElementById("voteForm");
const candidateListDiv = document.getElementById("candidateList"); // For voting radio buttons
const voteMessage = document.getElementById("voteMessage");
const welcomeVoterP = document.getElementById("welcomeVoter");

const resultsSection = document.getElementById("resultsSection");
const voteResultsList = document.getElementById("voteResultsList");

const registerAgainButton = document.getElementById("registerAgainButton");

// --- NEW: DOM Element for Candidate Info Display ---
const candidateInfoListDiv = document.getElementById("candidateInfoList"); // The row div in the new top section

// --- Functions ---

// Initialize Leaflet Map
function initializeMap(lat, lng, addressString) {
  // ... (keep as is) ...
   if (map) { map.setView([lat, lng], 15); } else { map = L.map(mapDiv, {}).setView([lat, lng], 15); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors', }).addTo(map); map.getContainer().setAttribute("role", "application"); } if (marker) { marker.setLatLng([lat, lng]); } else { marker = L.marker([lat, lng], { keyboard: true, alt: `Location marker for ${addressString}`, }).addTo(map); } marker.bindPopup(`<b>Verified Location:</b><br>${addressString}`).openPopup(); mapContainer.style.display = "block";
}


// --- NEW FUNCTION: Populate Candidate Info Display Area ---
function displayCandidateInfo(candidates) {
    console.log("Populating candidate info display area...");
    if (!candidateInfoListDiv) {
        console.error("Candidate info display area (#candidateInfoList) not found.");
        return;
    }
    candidateInfoListDiv.innerHTML = ''; // Clear loading message or previous content

    if (candidates.length === 0) {
        candidateInfoListDiv.innerHTML = '<p class="text-center text-muted">No candidates to display.</p>';
        return;
    }

    candidates.forEach(candidate => {
        // Create a column for each candidate (e.g., using Bootstrap grid)
        const col = document.createElement('div');
        // Adjust column size based on number of candidates (e.g., col-md-3 for 4 candidates)
        col.className = 'col-6 col-md-3';

        const card = document.createElement('div');
        card.className = 'candidate-display-card';

        // Image
        const img = document.createElement('img');
        // Provide a default/fallback image if imageUrl is missing
        img.src = candidate.imageUrl || 'https://via.placeholder.com/80/CCC/888?text=No+Image';
        img.alt = `Photo of ${candidate.firstName} ${candidate.lastName || ''}`;
        img.className = 'img-fluid'; // Bootstrap class for responsiveness

        // Name and Party
        const namePara = document.createElement('p');
        namePara.className = 'mb-0 fw-bold';
        namePara.textContent = `${candidate.firstName} ${candidate.lastName || ''}`;

        const partyPara = document.createElement('p');
        partyPara.className = 'mb-0 small';
        partyPara.textContent = `(${candidate.party})`;

        // Assemble the card
        card.appendChild(img);
        card.appendChild(namePara);
        card.appendChild(partyPara);
        col.appendChild(card);
        candidateInfoListDiv.appendChild(col); // Add the column to the row
    });
}


// Fetch Candidates and Populate BOTH Displays + Results Structure
async function fetchAndDisplayCandidates() {
  console.log("Running fetchAndDisplayCandidates...");
  isResultsStructureBuilt = false;
  candidateListDiv.innerHTML = '<p>Loading candidates...</p>'; // For voting form
  candidateInfoListDiv.innerHTML = '<p class="text-center">Loading candidates...</p>'; // For top display
  voteResultsList.innerHTML = '<li>Loading results...</li>';

  try {
    console.log("FETCH: Fetching candidates from /api/candidates...");
    const response = await fetch("/api/candidates");
    if (!response.ok) {
       console.error(`FETCH: HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const candidates = await response.json();
    console.log("FETCH: Candidates received:", candidates);

    // --- Populate Candidate Info Display (NEW CALL) ---
    displayCandidateInfo(candidates);

    // --- Populate Candidate Voting List ---
    candidateListDiv.innerHTML = ""; // Clear loading message
    if (candidates.length === 0) {
       console.log("FETCH: No candidates found in response.");
       candidateListDiv.innerHTML = '<p class="text-warning">No candidates found.</p>';
       voteResultsList.innerHTML = '<li>No candidates found.</li>';
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
                    ${candidate.firstName} ${candidate.lastName || ''} (${candidate.party})
                </span>
            `;
      candidateListDiv.appendChild(label);
    });

    // --- Build the initial results display structure ---
    console.log("FETCH: Building initial results structure...");
    updateVoteResultsDisplay(null, candidates);

    // --- Set Flag and Request Counts ---
    console.log("FETCH: Setting isResultsStructureBuilt = true");
    isResultsStructureBuilt = true;
    console.log("FETCH: Emitting getInitialCounts.");
    socket.emit("getInitialCounts");

  } catch (error) {
    console.error("FETCH: Error fetching or displaying candidates:", error);
    candidateListDiv.innerHTML =
      '<p class="text-danger">Could not load candidates.</p>';
    candidateInfoListDiv.innerHTML = '<p class="text-center text-danger">Error loading candidates.</p>'; // Update info display on error too
    voteResultsList.innerHTML = "<li>Error loading candidate results.</li>";
     isResultsStructureBuilt = false;
  }
}

// Update Vote Results Display Structure or Counts
function updateVoteResultsDisplay(voteCounts, candidates = []) {
  // ... (keep this function as is from previous version) ...
  if (voteCounts === null) { voteResultsList.innerHTML = ""; if (candidates.length === 0) { voteResultsList.innerHTML = "<li>No candidates available to display results.</li>"; return; } console.log("UPDATE_DISPLAY: Building initial structure for results list."); candidates.forEach((candidate) => { const candidateIdentifier = candidate.candidateId || candidate._id; const li = document.createElement("li"); const nameSpan = document.createElement('span'); nameSpan.textContent = `${candidate.firstName} ${candidate.lastName || ''}: `; const countSpan = document.createElement('span'); countSpan.id = `votes-${candidateIdentifier}`; countSpan.textContent = '0'; li.appendChild(nameSpan); li.appendChild(countSpan); voteResultsList.appendChild(li); }); } else { console.log("UPDATE_DISPLAY: Received voteCounts event with:", voteCounts); if (!isResultsStructureBuilt) { console.warn("UPDATE_DISPLAY: isResultsStructureBuilt is FALSE. Ignoring update."); return; } console.log("UPDATE_DISPLAY: Updating counts with data:", voteCounts); if (!resultsSection.classList.contains('d-none')) { // Only log/update if visible (or always update?) resultsSection.classList.remove('d-none'); } for (const candidateId in voteCounts) { const countSpan = document.getElementById(`votes-${candidateId}`); if (countSpan) { countSpan.textContent = voteCounts[candidateId]; } else { console.warn(`UPDATE_DISPLAY: Count span for candidate ID ${candidateId} not found during update.`); } } }
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
   candidateListDiv.innerHTML = '<p>Loading candidates...</p>';
   voteResultsList.innerHTML = '<li>Loading results...</li>';
   isResultsStructureBuilt = false;

   // No need to call fetchAndDisplayCandidates here,
   // as the top candidate display should remain visible.
   // Only the VOTE list and results counts need interaction.
   // If the top display also needed refresh, we'd call it.
   console.log("RESET: UI Reset complete.");

}

// --- Event Listeners ---

// Handle Registration Form Submission
registerForm.addEventListener("submit", async (e) => {
  // ... (keep as is, ensures resultsSection remains hidden) ...
    e.preventDefault(); console.log("Registration form submitted."); registrationMessage.textContent = "Registering and verifying address..."; mapContainer.style.display = "none"; resultsSection.classList.add('d-none'); const formData = new FormData(registerForm); const data = Object.fromEntries(formData.entries()); try { const response = await fetch("/api/users/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), }); const result = await response.json(); if (response.ok) { console.log("Registration successful:", result); currentVoterId = result.userId; registrationMessage.textContent = `Registration successful! Welcome ${data.firstName}. Your Voter ID: ${currentVoterId}`; registrationMessage.className = "alert alert-success"; if (result.latitude && result.longitude) { const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`; initializeMap(result.latitude, result.longitude, fullAddress); } else { console.warn("Geolocation data missing in registration response."); mapContainer.style.display = "none"; } welcomeVoterP.textContent = `Welcome, ${data.firstName}! Please cast your vote.`; votingSection.style.display = "block"; /* Results hidden until vote */ /* Candidates already loaded on connect */ registrationSection.style.display = "none"; } else { console.error("Registration failed response:", result); registrationMessage.textContent = `Registration failed: ${ result.message || "Unknown error" }`; registrationMessage.className = "alert alert-danger"; currentVoterId = null; votingSection.style.display = "none"; resultsSection.classList.add("d-none"); } } catch (error) { console.error("Registration error:", error); registrationMessage.textContent = "An error occurred during registration."; registrationMessage.className = "alert alert-danger"; currentVoterId = null; votingSection.style.display = "none"; resultsSection.classList.add("d-none"); }
});

// Handle Vote Form Submission
voteForm.addEventListener("submit", (e) => {
  // ... (keep as is) ...
  e.preventDefault(); voteMessage.textContent = ""; const selectedCandidateInput = document.querySelector( 'input[name="candidate"]:checked' ); if (!currentVoterId) { voteMessage.textContent = "Error: Voter ID not found. Please register first."; voteMessage.className = "alert alert-danger"; return; } if (selectedCandidateInput) { const voteData = { candidateId: selectedCandidateInput.value, voterId: currentVoterId, }; console.log("Emitting submitVote:", voteData); socket.emit("submitVote", voteData); voteMessage.textContent = "Submitting your vote..."; voteMessage.className = "alert alert-info"; } else { voteMessage.textContent = "Please select a candidate before submitting."; voteMessage.className = "alert alert-warning"; }
});

// Event listener for the 'Register Another Voter' button
registerAgainButton.addEventListener("click", () => {
  resetToRegisterState();
});

// --- Socket.IO Event Handlers ---

socket.on("connect", () => {
  console.log("SOCKET: Connected to Socket.IO server");
  // Fetch candidates immediately on connect to build UI structure early
  // This now populates the top display AND the hidden voting form radios/results structure
  fetchAndDisplayCandidates();
});

socket.on("voteCounts", (voteCounts) => {
  console.log("SOCKET: Received voteCounts event with:", voteCounts);
  // Update the counts. The results section visibility is handled separately.
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

    // --- Show RESULTS SECTION ONLY ON VOTE SUCCESS ---
    resultsSection.classList.remove("d-none");
    // --- END CHANGE ---

  } else {
    // ... (keep error handling as is) ...
    console.error("Vote submission failed:", data.message); voteMessage.textContent = `Vote submission failed: ${data.message}`; voteMessage.className = "alert alert-danger"; voteForm .querySelectorAll("input, button") .forEach((el) => (el.disabled = false)); registerAgainButton.classList.add("d-none"); resultsSection.classList.add("d-none");
  }
});

socket.on("disconnect", () => {
  // ... (keep as is) ...
   console.log("SOCKET: Disconnected from Socket.IO server"); if (!resultsSection.classList.contains('d-none')) { voteResultsList.innerHTML = "<li>Disconnected. Vote counts may be outdated.</li>"; }
});

// --- Initial Load ---
votingSection.style.display = "none";
mapContainer.style.display = "none";
registrationSection.style.display = "block";
// Results section starts hidden via HTML class 'd-none'
isResultsStructureBuilt = false;
console.log("Initial Load: UI set, Results hidden, isResultsStructureBuilt=false");
// Top candidate display area will show "Loading..." until fetch completes