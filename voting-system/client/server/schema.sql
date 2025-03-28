CREATE DATABASE voting_system;

USE voting_system;

CREATE TABLE voters (
  voterId INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255)
);

CREATE TABLE addresses (
  addressId INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  zipCode INT,
  latitude FLOAT,
  longitude FLOAT,
  voterId INT,
  FOREIGN KEY (voterId) REFERENCES voters(voterId)
);

CREATE TABLE candidates (
  candidateId INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  party ENUM('Party A', 'Party B')
);

CREATE TABLE votes (
  voteId INT AUTO_INCREMENT PRIMARY KEY,
  voterId INT,
  candidateId INT,
  dateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (voterId) REFERENCES voters(voterId),
  FOREIGN KEY (candidateId) REFERENCES candidates(candidateId)
);
