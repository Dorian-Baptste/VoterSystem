# Voting System

## Overview
This project is a web-based voting system where users can register, verify their address, and vote for one of four candidates. The system includes real-time voting updates and an accessible map for visually impaired users.

## Installation

### 1. Clone the repository:
```sh
git clone https://github.com/yourusername/voting-system.git
cd voting-system
```

### 2. Install dependencies:
Run the following command to install all required dependencies:
```sh
npm install
```

#### **Dependencies Installed:**
| Dependency  | Purpose |
|-------------|---------|
| `express` | Handles routing and server logic |
| `mongoose` | Connects to MongoDB for database operations |
| `socket.io` | Enables real-time communication for vote updates |
| `axios` | Makes HTTP requests (used for Google Maps API) |

#### **Development Dependencies:**
| Dependency  | Purpose |
|-------------|---------|
| `nodemon` | Automatically restarts the server during development when files change |

If you need to install dependencies manually, use:
```sh
npm install express mongoose socket.io axios
```
To install `nodemon` (for development):
```sh
npm install nodemon --save-dev
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```
Replace `your_google_maps_api_key` with your actual Google Maps API key.

### 4. Start the application
To run the server, use:
```sh
npm start
```
For development mode (with automatic server restart):
```sh
npm run dev
```

## Features
- User registration and address verification
- Voting for one of four candidates
- Real-time updates with Socket.IO
- Accessible map for visually impaired users

## Project Structure
```
/voting-system
│-- /public
│   │-- /css/styles.css
│   │-- /js/main.js
│   │-- index.html
│-- /src
│   │-- /controllers
│   │   │-- userController.js
│   │   │-- voteController.js
│   │-- /models
│   │   │-- voterModel.js
│   │   │-- addressModel.js
│   │   │-- voteModel.js
│   │-- /routes
│   │   │-- userRoutes.js
│   │   │-- voteRoutes.js
│   │-- /services
│   │   │-- googleMapsService.js
│   │-- app.js
│-- /config
│   │-- config.js
│-- .env
│-- package.json
│-- README.md
```

## License
This project is licensed under the MIT License.