-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS voting_system;
USE voting_system;

-- Drop tables if they already exist to avoid conflicts
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS voters;

-- Create the Voters table
CREATE TABLE IF NOT EXISTS voters (
    voterId INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL
);

-- Create the Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    addressId INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zipCode VARCHAR(20) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    voterId INT NOT NULL,
    FOREIGN KEY (voterId) REFERENCES voters(voterId) ON DELETE CASCADE
);

-- Create the Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    candidateId INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    party ENUM('Party A', 'Party B') NOT NULL
);

-- Create the Votes table
CREATE TABLE IF NOT EXISTS votes (
    voteId INT AUTO_INCREMENT PRIMARY KEY,
    voterId INT NOT NULL,
    candidateId INT NOT NULL,
    dateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voterId) REFERENCES voters(voterId) ON DELETE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES candidates(candidateId) ON DELETE CASCADE
);
