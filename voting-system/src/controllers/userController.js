const Voter = require("../models/voterModel"); // Changed from User to Voter
const Address = require("../models/addressModel");
const googleMapsService = require("../services/googleMapsService");

// Register a new voter
exports.registerUser = async (req, res) => {
  // Ensure zip is consistently named (e.g., 'zip' from form, 'zipCode' in schema?)
  // Assuming form sends 'zip', schema uses 'zip' based on provided model
  const { firstName, lastName, address, city, state, zip } = req.body;

  if (!firstName || !lastName || !address || !city || !state || !zip) {
    return res
      .status(400)
      .json({ message: "Missing required registration fields." });
  }

  try {
    // Verify address using the service
    // The service expects (address, city, state, zip)
    const geolocation = await googleMapsService.verifyAddress(
      address,
      city,
      state,
      zip
    );

    // Check if verification was successful
    if (
      !geolocation ||
      typeof geolocation.lat === "undefined" ||
      typeof geolocation.lng === "undefined"
    ) {
      // Handle case where geocoding failed but didn't throw an error in the service
      throw new Error("Address could not be verified or geocoded.");
    }

    // Check if voter already exists (e.g., by name - simple check)
    // In a real app, use a more robust check (e.g., unique ID number, email)
    const existingVoter = await Voter.findOne({ firstName, lastName });
    if (existingVoter) {
      // Decide how to handle existing users - prevent re-registration?
      // For now, let's prevent it.
      return res
        .status(409)
        .json({ message: "A voter with this name already exists." });
    }

    // Save voter to database
    const newVoter = new Voter({ firstName, lastName });
    await newVoter.save();

    // Save address to database, linking to the new voter
    const newAddress = new Address({
      address,
      city,
      state,
      zip, // Ensure this matches the schema field name
      latitude: geolocation.lat,
      longitude: geolocation.lng,
      voterId: newVoter._id, // Link using the newly created voter's ID
    });
    await newAddress.save();

    console.log(
      `Voter registered: ${newVoter.firstName} ${newVoter.lastName}, ID: ${newVoter._id}`
    );

    // Return success response including the voterId and coordinates for the map
    res.status(201).json({
      message: "User registered successfully",
      userId: newVoter._id, // Send back the ID
      latitude: geolocation.lat, // Send back coordinates
      longitude: geolocation.lng,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    // Provide more specific error messages if possible
    let errorMessage = "Error registering user";
    if (
      error.message.includes("Address could not be verified") ||
      error.message.includes("Address verification failed") ||
      error.message.includes("Error contacting Google Maps API")
    ) {
      errorMessage = `Address Verification Failed: ${error.message}. Please check the address details.`;
    } else if (error.code === 11000) {
      // Handle potential duplicate key errors if unique indexes are added
      errorMessage = "An error occurred (potential duplicate entry).";
    }

    res.status(400).json({ message: errorMessage, error: error.message });
  }
};
