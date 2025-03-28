const User = require("../models/voterModel");
const Address = require("../models/addressModel");
const googleMapsService = require("../services/googleMapsService");

// Register a new user
exports.registerUser = async (req, res) => {
  const { firstName, lastName, address, city, state, zip } = req.body;

  try {
    // Verify address
    const geolocation = await googleMapsService.verifyAddress(
      address,
      city,
      state,
      zip
    );

    // Save user to database
    const user = new User({ firstName, lastName });
    await user.save();

    // Save address to database
    const newAddress = new Address({
      address,
      city,
      state,
      zip,
      latitude: geolocation.lat,
      longitude: geolocation.lng,
      voterId: user._id,
    });
    await newAddress.save();

    res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    res.status(400).json({ message: "Error registering user", error });
  }
};
