Project Overview:
This project is a web-based Voting System that leverages Bootstrap, Node.js, Socket.IO and a Database (your choice) to enable a user-friendly voting process. The system will ensure that each voter’s identity and address are verified, while also allowing real-time updates and interaction through Socket.IO. Make sure your code is posted on GitHub.

Key Features:User Registration & Address Verification:
Users will be required to input their home address during registration.
Address verification will be performed using Google Maps Geocoder API or Mapbox  Geocoder API. After verifying the address, it will be visually pinpointed on a map for visually impaired users using an accessible map interface.
The user's personal information, such as first and last name, will also be recorded.
This information will be stored in a voters table.
The voters table will contain:
voterId (Primary Key, unique)
firstName
lastName
The addresses table will contain:
addressId (Primary Key, unique)
Address
city
state
zip
latitude
longitude
voterId (Foreign Key referencing the voters table)
Voting:
Users will vote for one of the four candidates. The candidates are split into two parties:
Party A:
Candidate A1 (e.g., John Doe)
Candidate A2 (e.g., Jane Smith)
Party B:
Candidate B1 (e.g., Mark Johnson)
Candidate B2 (e.g., Sarah Brown)
Users will select one candidate from either party (with an option to vote for their preferred candidate).After the user votes, the vote is stored in the votes table with:
voteId (Primary Key, unique)
voterId (Foreign Key referencing the voters table)
candidateId (Foreign Key referencing the candidates)
dateTime (timestamp of when the vote occurred)
Real-Time Interaction (Socket.IO):
The system will use Socket.IO to provide real-time updates on the voting status, allowing users to see the current results of the election as they vote.
Every time a vote is cast, the vote count for each candidate will update in real time on the front end.
Accessible Map for Visually Impaired:
A map will be displayed on the frontend using Bootstrap and integrated with either Google Maps or Mapbox. The map will show the voter’s address as a pin.
For visually impaired users, an accessible version of the map (using screen reader support) will ensure they can navigate the map interface.
System Architecture & Technologies:Frontend (Client Side):
Responsive Design or Bootstrap: build the responsive user interface, ensuring a mobile-friendly design on any platform.
Socket.IO Client: For establishing a real-time connection with the server to update the voting status and provide feedback to users in real time.
Google Maps Geocoder API (better than Mapbox) or Mapbox API: For address verification and visually impaired accessible map rendering.
HTML/CSS/JavaScript: For basic structure and interactive elements, such as the form for address entry and candidate voting selection.
Backend (Server Side):
Node.js: The server-side technology to handle requests, perform database operations, and manage Socket.IO connections.
Express.js: For routing requests and handling user interactions.
Socket.IO: For real-time communication between the server and client (e.g., updating vote count, notifying other users of new votes).
Database: A relational database (MySQL, SQLite3, MongoDB or PostgreSQL) to store user data and votes.
Database Schema:
Voters Table:
voterId (INT, Primary Key, Auto Increment)
firstName (VARCHAR)
lastName (VARCHAR)
Addresses Table:
addressId (INT, Primary Key, Auto Increment)
address (VARCHAR)
city (VARCHAR)
state (VARCHAR)
zipCode (INT)
latitude (FLOAT)
longitude (FLOAT)
voterId (INT, Foreign Key referencing voters.voterId)
Candidates Table:
candidateId (INT, Primary Key, Auto Increment)
firstName (VARCHAR)
lastName (VARCHAR)
party (ENUM, ['Party A', 'Party B'])
Votes Table:
voteId (INT, Primary Key, Auto Increment)
voterId (INT, Foreign Key referencing voters.voterId)
candidateId (INT, Foreign Key referencing candidates.candidateId)
dateTime (TIMESTAMP)
Flow of the System:User Registration & Address Entry:
The user accesses a form to register their name (first and last) and home address.
Once the user enters their address, the backend verifies it using Google Maps or Mapbox Geocoder.
The address is stored in the addresses table along with the geolocation (latitude and longitude). The voter’s ID is used as a foreign key to associate the address with the voter.
Voting Process:
The user is presented with a list of candidates (four candidates, two per party).
The user selects their preferred candidate and submits the vote.
The vote is saved in the votes table, capturing the voter’s ID, the candidate’s ID, and the time of the vote.
Real-Time Updates:
Socket.IO sends real-time updates to all connected users, showing the updated vote counts for each candidate as new votes are cast.