USE voting_system;

-- Insert Sample Voters
INSERT INTO voters (firstName, lastName) VALUES 
('John', 'Doe'),
('Jane', 'Smith'),
('Mark', 'Johnson'),
('Sarah', 'Brown');

-- Insert Sample Addresses (Linked to Voter IDs)
INSERT INTO addresses (address, city, state, zipCode, latitude, longitude, voterId) VALUES
('123 Main St', 'New York', 'NY', '10001', 40.7128, -74.0060, 1),
('456 Elm St', 'Los Angeles', 'CA', '90001', 34.0522, -118.2437, 2),
('789 Pine St', 'Chicago', 'IL', '60601', 41.8781, -87.6298, 3),
('101 Maple St', 'Houston', 'TX', '77001', 29.7604, -95.3698, 4);

-- Insert Sample Candidates
INSERT INTO candidates (firstName, lastName, party) VALUES
('John', 'Doe', 'Party A'),
('Jane', 'Smith', 'Party A'),
('Mark', 'Johnson', 'Party B'),
('Sarah', 'Brown', 'Party B');

-- Insert Sample Votes (Voters Selecting Candidates)
INSERT INTO votes (voterId, candidateId) VALUES
(1, 1),  -- John Doe votes for Candidate 1
(2, 3),  -- Jane Smith votes for Candidate 3
(3, 2),  -- Mark Johnson votes for Candidate 2
(4, 4);  -- Sarah Brown votes for Candidate 4
