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
            imageUrl: "https://lh4.googleusercontent.com/proxy/J0E_Di1ggQTeLHAQAl0SDU6hyDXS8yk-1YzC4yTttJDeY-VZf1jAALQj5BsrhimTjPIj9BhVlzJxUZB441j8wpSoDMDVC317afEjyCBgcsPUTw"
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
            firstName: "Diddy",
            lastName: "Dhanraj",
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