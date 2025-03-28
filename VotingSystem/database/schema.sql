CREATE TABLE voters (
    voterId INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(100),
    lastName VARCHAR(100)
);

CREATE TABLE addresses (
    addressId INT PRIMARY KEY AUTO_INCREMENT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zipCode INT,
    latitude FLOAT,
    longitude FLOAT,
    voterId INT,
    FOREIGN KEY (voterId) REFERENCES voters(voterId)
);

CREATE TABLE candidates (
    candidateId INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    party ENUM('Party A', 'Party B')
);

CREATE TABLE votes (
    voteId INT PRIMARY KEY AUTO_INCREMENT,
    voterId INT,
    candidateId INT,
    dateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voterId) REFERENCES voters(voterId),
    FOREIGN KEY (candidateId) REFERENCES candidates(candidateId)
);
