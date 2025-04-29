const socket = io(); // Initialize the Socket.IO connection

// --- State Variable ---
let currentVoterId = null; // Store voter ID after registration
let map = null; // Leaflet map instance
let marker = null; // Leaflet marker instance

// --- DOM Elements ---
const registerForm = document.getElementById("registerForm");
const registrationMessage = document.getElementById("registrationMessage");
const mapContainer = document.getElementById("mapContainer");
const mapDiv = document.getElementById("map");

const votingSection = document.getElementById("votingSection");
const voteForm = document.getElementById("voteForm");
const candidateListDiv = document.getElementById("candidateList");
const voteMessage = document.getElementById("voteMessage");
const welcomeVoterP = document.getElementById("welcomeVoter");

const resultsSection = document.getElementById("resultsSection");
const voteResultsList = document.getElementById("voteResultsList");

// --- Functions ---

// Initialize Leaflet Map
function initializeMap(lat, lng, addressString) {
  if (map) {
    // If map already exists, just update view and marker
    map.setView([lat, lng], 15);
  } else {
    // Create new map
    map = L.map(mapDiv, {
      // Add accessibility options if needed, e.g., preferCanvas: true for some screen readers
    }).setView([lat, lng], 15); // Set view to coordinates, zoom level 15

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    // Add ARIA role for screen readers - may need more depending on complexity
    map.getContainer().setAttribute("role", "application");
  }

  // Add/update marker
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], {
      // Make marker keyboard accessible and provide alt text
      keyboard: true,
      alt: `Location marker for ${addressString}`, // Important for accessibility
    }).addTo(map);
  }

  // Add popup (optional)
  marker.bindPopup(`<b>Verified Location:</b><br>${addressString}`).openPopup();
  mapContainer.style.display = "block"; // Show the map container
}

// Fetch Candidates and Populate Form
async function fetchAndDisplayCandidates() {
  try {
    // Use fetch API to get candidates from backend (needs backend route)
    const response = await fetch("/api/candidates"); // Assumes backend route exists
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const candidates = await response.json();

    candidateListDiv.innerHTML = ""; // Clear loading message
    candidates.forEach((candidate) => {
      const label = document.createElement("label");
      label.className = "form-check";
      // Use candidate._id or candidate.candidateId depending on your model choice
      const candidateIdentifier = candidate.candidateId || candidate._id;
      label.innerHTML = `
                <input class="form-check-input" type="radio" name="candidate" value="${candidateIdentifier}" required>
                <span class="form-check-label">
                    ${candidate.firstName} ${candidate.lastName} (${candidate.party})
                </span>
            `;
      candidateListDiv.appendChild(label);
    });

    // Also update the results list display structure initially
    updateVoteResultsDisplay(null, candidates); // Pass candidates for initial structure
  } catch (error) {
    console.error("Error fetching candidates:", error);
    candidateListDiv.innerHTML =
      '<p class="text-danger">Could not load candidates.</p>';
    // Handle error in results display as well
    voteResultsList.innerHTML = "<li>Error loading candidate results.</li>";
  }
}

// Update Vote Results Display
function updateVoteResultsDisplay(voteCounts, candidates = []) {
  // If voteCounts is null, use the candidates list to build the initial structure
  if (voteCounts === null) {
    voteResultsList.innerHTML = ""; // Clear loading/error message
    if (candidates.length === 0) {
      voteResultsList.innerHTML =
        "<li>No candidates available to display results.</li>";
      return;
    }
    candidates.forEach((candidate) => {
      const candidateIdentifier = candidate.candidateId || candidate._id;
      const li = document.createElement("li");
      li.innerHTML = `${candidate.firstName} ${candidate.lastName}: <span id="votes-${candidateIdentifier}">0</span>`;
      voteResultsList.appendChild(li);
    });
  } else {
    // Update counts for each candidate span
    for (const candidateId in voteCounts) {
      const countSpan = document.getElementById(`votes-${candidateId}`);
      if (countSpan) {
        countSpan.textContent = voteCounts[candidateId];
      } else {
        // This might happen if the results list wasn't built correctly initially
        console.warn(`Count span for candidate ID ${candidateId} not found.`);
      }
    }
  }
}

// --- Event Listeners ---

// Handle Registration Form Submission
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registrationMessage.textContent = "Registering and verifying address...";
  mapContainer.style.display = "none"; // Hide map initially

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
      currentVoterId = result.userId; // ** STORE voterId **
      registrationMessage.textContent = `Registration successful! Welcome ${data.firstName}. Your Voter ID: ${currentVoterId}`; // Display success and ID
      registrationMessage.className = "alert alert-success";

      // Display Map
      if (result.latitude && result.longitude) {
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`;
        initializeMap(result.latitude, result.longitude, fullAddress);
      } else {
        console.warn("Geolocation data missing in registration response.");
        mapContainer.style.display = "none";
      }

      // Show voting section and fetch candidates
      welcomeVoterP.textContent = `Welcome, ${data.firstName}! Please cast your vote.`;
      votingSection.style.display = "block";
      await fetchAndDisplayCandidates(); // Fetch candidates after successful registration
      registerForm.reset(); // Clear registration form
      // Optionally hide registration form after success
      document.getElementById("registrationSection").style.display = "none";
    } else {
      registrationMessage.textContent = `Registration failed: ${
        result.message || "Unknown error"
      }`;
      registrationMessage.className = "alert alert-danger";
      currentVoterId = null;
      votingSection.style.display = "none"; // Hide voting section on failure
    }
  } catch (error) {
    console.error("Registration error:", error);
    registrationMessage.textContent = "An error occurred during registration.";
    registrationMessage.className = "alert alert-danger";
    currentVoterId = null;
    votingSection.style.display = "none";
  }
});

// Handle Vote Form Submission
voteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  voteMessage.textContent = ""; // Clear previous messages

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
      // Use the candidateId (Number) or _id (String) based on your model/fetching
      candidateId: selectedCandidateInput.value,
      voterId: currentVoterId, // Include voterId
    };

    // Send the vote to the server via Socket.IO
    socket.emit("submitVote", voteData);

    // Provide feedback and potentially disable form
    voteMessage.textContent = "Your vote has been submitted!";
    voteMessage.className = "alert alert-success";
    // Disable form inputs after voting
    voteForm
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = true));
  } else {
    voteMessage.textContent = "Please select a candidate before submitting.";
    voteMessage.className = "alert alert-warning";
  }
});

// --- Socket.IO Event Handlers ---

// Listen for connection confirmation (optional)
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  // Request initial candidates and counts when connected
  fetchAndDisplayCandidates(); // Fetch candidates structure
  socket.emit("getInitialCounts"); // Ask server for current counts
});

// Listen for vote count updates from the server
socket.on("voteCounts", (voteCounts) => {
  console.log("Received updated vote counts:", voteCounts);
  // Ensure the display structure is ready before updating counts
  // If candidateListDiv is empty, it means candidates haven't loaded yet.
  // updateVoteResultsDisplay handles this internally if candidates array is passed.
  // We rely on fetchAndDisplayCandidates having run first.
  updateVoteResultsDisplay(voteCounts);
});

// Listen for vote confirmation/error (optional, good practice)
socket.on("voteStatus", (data) => {
  if (data.success) {
    console.log("Vote successfully recorded by server.");
    // Message already shown optimistically, maybe update text slightly?
    voteMessage.textContent = "Vote successfully recorded!";
    voteMessage.className = "alert alert-success";
  } else {
    console.error("Vote submission failed:", data.message);
    voteMessage.textContent = `Vote submission failed: ${data.message}`;
    voteMessage.className = "alert alert-danger";
    // Re-enable form if vote failed server-side
    voteForm
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = false));
  }
});

// Handle disconnection (optional)
socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
  voteResultsList.innerHTML = "<li>Disconnected. Trying to reconnect...</li>"; // Indicate connection issue
});

// --- Initial Load ---
// Fetch initial data when the script loads (or wait for socket connection)
// fetchAndDisplayCandidates(); // Moved to run after socket connection
