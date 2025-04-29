# Voting System

## Overview
This project is a web-based voting system where users can register, verify their address using Google Maps Geocoding API, vote for one of several candidates, and see live results via Socket.IO. It aims to provide an accessible map interface for visually impaired users (using Leaflet).

## Features
- User registration and address verification (Google Maps Geocoding)
- Visual map display of verified address (Leaflet)
- Voting for one of four candidates across two parties
- Real-time vote count updates using Socket.IO
- (Goal: Enhance map display for accessibility)

## Technologies Used

* **Frontend:** HTML, CSS, JavaScript, Bootstrap 5 (via CDN), Socket.IO Client, Leaflet.js (via CDN)
* **Backend:** Node.js, Express.js, Mongoose, Socket.IO Server, Axios, Dotenv
* **Database:** MongoDB
* **APIs:** Google Maps Geocoding API
* **Development:** nodemon

## Project Structure
/voting-system
│-- /public
│   │-- /css/styles.css     # Custom CSS overrides
│   │-- /js/main.js         # Frontend JavaScript (UI logic, Socket.IO client, Leaflet map)
│   │-- index.html          # Main HTML file
│-- /src
│   │-- /controllers
│   │   │-- userController.js # Handles user registration logic
│   │   │-- voteController.js # (Minimal - voting logic primarily in app.js Socket.IO)
│   │-- /models
│   │   │-- voterModel.js     # Mongoose schema for voters
│   │   │-- addressModel.js   # Mongoose schema for addresses
│   │   │-- voteModel.js      # Mongoose schema for votes
│   │   │-- candidateModel.js # Mongoose schema for candidates
│   │-- /routes
│   │   │-- userRoutes.js     # API routes for user actions (/api/users)
│   │   │-- voteRoutes.js     # (Minimal - /api/votes)
│   │-- /services
│   │   │-- googleMapsService.js # Handles Google Geocoding API calls
│   │-- app.js                # Main Express server setup, Socket.IO handling, DB connection
│-- /config
│   │-- config.js           # Configuration (DB URI reference)
│-- .env                    # Environment variables (API Key) - MUST BE CREATED
│-- .gitignore              # Specifies intentionally untracked files (add .env!)
│-- package.json            # Project metadata and dependencies
│-- package-lock.json       # Exact dependency versions
│-- README.md               # This file


## Prerequisites
Before you begin, ensure you have the following installed and configured:
* **Node.js and npm:** (LTS version recommended) [Download Node.js](https://nodejs.org/)
* **MongoDB:** The database must be installed and **running** locally. See guides: [Install MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/). (Homebrew is recommended for macOS).
* **Git:** For cloning the repository. [Download Git](https://git-scm.com/).
* **Google Maps API Key:** An active API key from Google Cloud Console is required. Ensure:
    * The **Geocoding API** is enabled for your project.
    * The project is linked to an active **Billing Account**.
    * The key has appropriate restrictions (or none for initial testing). Get started: [Google Cloud Console](https://console.cloud.google.com/).

## Installation and Setup

1.  **Clone the Repository:**
    ```sh
    # Replace <your-repository-url> if you forked the project
    git clone <your-repository-url>
    cd voting-system
    ```

2.  **Install Dependencies:**
    This command installs all necessary packages defined in `package.json`.
    ```sh
    npm install
    ```

3.  **Create and Configure `.env` File:**
    This file stores your secret API key. Create a file named exactly `.env` in the project root (`voting-system/`). Add your Google Maps API Key:
    ```dotenv
    # .env file
    # Replace YOUR_ACTUAL_GOOGLE_MAPS_GEOCODING_API_KEY with your actual key from Google Cloud Console
    GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_GEOCODING_API_KEY

    # Optional: You can also specify the port here if needed
    # PORT=3001
    ```
    **Security:** Add `.env` to your `.gitignore` file immediately to avoid committing secrets. If `.gitignore` doesn't exist, create it and add:
    ```
    node_modules/
    .env
    ```

## Running the Application

1.  **Ensure MongoDB is Running:**
    *(Keep this subsection as is)*
    Before starting the Node.js application, your MongoDB server **must** be running.
    * **macOS (using Homebrew Service - Recommended):**
        * Check status: `brew services list` (Look for `mongodb-community`, status should be `started`).
        * Start if stopped: `brew services start mongodb-community`.
    * **Linux (using systemd):**
        * Check status: `sudo systemctl status mongod` (Look for `active (running)`).
        * Start if stopped: `sudo systemctl start mongod`.
    * **Other Methods:** Follow the specific instructions for how you run MongoDB. Ensure it's listening on `localhost:27017` (or update `config/config.js` if different).

2.  **Seed Candidate Data (One-Time Step):**
    The application needs initial candidate data in the database, including names, parties, and image URLs. If starting with an empty `candidates` collection:
    * Open the MongoDB Shell: `mongosh`
    * Switch to the database: `use votingSystem`
    * Run the following command to insert the candidates. **IMPORTANT:** Replace the placeholder `imageUrl` values with actual, valid URLs for your candidate images.
        ```javascript
        db.candidates.insertMany([
          {
            candidateId: 1,
            firstName: "Marcus",
            lastName: "Ching",
            party: "Party A",
            imageUrl: "data:image/jpeg;base64,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"
          },
          {
            candidateId: 2,
            firstName: "Darius",
            lastName: "",
            party: "Party A",
            imageUrl: "https://img.freepik.com/premium-photo/black-child-with-afro-happy-having-fun-white-background-pixar-style2_27550-4938.jpg"
           },
          {
            candidateId: 3,
            firstName: "Meggy",
            lastName: "Weggy",
            party: "Party B",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/6/67/Herbert_-_Family_Guy.png"
          },
          {
            candidateId: 4,
            firstName: "Bombardino",
            lastName: "Crocodilo",
            party: "Party B",
            imageUrl: "https://images.cults3d.com/5rRxNhuOB_layW1t4n8hVfJ21Ik=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/30399929/illustration-file/3106e2a6-04ce-4117-8a2a-24b75a699fd4/untitled.506.png"
          }
        ]);
        ```
    * Verify the data was inserted correctly: `db.candidates.find().pretty();`
    * Exit the shell: `.exit`
    *(Note: If you already have candidate data without images, use `db.candidates.updateOne({ candidateId: ID }, { $set: { imageUrl: "URL" } });` for each candidate instead).*

3.  **Start the Node.js Server:**
    *(Keep this subsection as is)*
    * **For Development (recommended):**
        ```bash
        npm run dev
        ```
    * **For Production:**
        ```bash
        npm start
        ```
    * Look for the console messages: `Server is running on port 3000` (or your specified port) and `MongoDB Connected`.

4.  **Access the Application:**
    *(Keep this subsection as is)*
    Open your web browser and navigate to `http://localhost:3000` (or the correct port).


## Troubleshooting

* **Errors on Startup (`ECONNREFUSED`, Mongoose Timeouts):** MongoDB is likely not running or inaccessible. Double-check Step 1 in "Running the Application". Verify the database connection string in `config/config.js`.
* **Registration Fails (`Error contacting Google Maps API`):**
    * Verify the `GOOGLE_MAPS_API_KEY` in `.env` is correct and the file is saved properly.
    * Confirm the **Geocoding API** is enabled in Google Cloud Console.
    * Ensure the linked **Billing Account** is active in Google Cloud Console.
    * Check API key **restrictions** in Google Cloud Console (temporarily disable for testing if needed).
    * Restart the Node.js server after any changes to `.env`.
* **Candidates Don't Load / Voting Disabled:** Ensure you completed the "Seed Candidate Data" step (Step 2 in Running the Application). Check the `candidates` collection in your `votingSystem` database using `mongosh`.

## License
This project is licensed under the MIT License.