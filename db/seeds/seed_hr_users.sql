-- Seed initial Algoworks HR Recruiter accounts
-- Passwords should be securely hashed in production (bcrypt/argon2)

INSERT INTO users (name, email, password_hash, role)
VALUES
    ('Vanshika Batra', 'vanshika.batra@algoworks.com', '$2b$12$e8x/vU4xJ7d3Y9kI2uTqLe8J01K9uO8I8O6m5d4E3c2B1a0Z9y8x7', 'hr_recruiter'),
    ('Harshit Arora', 'harshit.arora@algoworks.com', '$2b$12$e8x/vU4xJ7d3Y9kI2uTqLe8J01K9uO8I8O6m5d4E3c2B1a0Z9y8x7', 'hr_recruiter'),
    ('Ashish Dwivedi', 'ashish.dwivedi@algoworks.com', '$2b$12$e8x/vU4xJ7d3Y9kI2uTqLe8J01K9uO8I8O6m5d4E3c2B1a0Z9y8x7', 'hr_recruiter'),
    ('Kali Agarwal', 'kali.agarwal@algoworks.com', '$2b$12$e8x/vU4xJ7d3Y9kI2uTqLe8J01K9uO8I8O6m5d4E3c2B1a0Z9y8x7', 'hr_recruiter'),
    ('Devesh Kumar', 'devesh.kumar@algoworks.com', '$2b$12$e8x/vU4xJ7d3Y9kI2uTqLe8J01K9uO8I8O6m5d4E3c2B1a0Z9y8x7', 'hr_recruiter')
ON CONFLICT (email) DO NOTHING;
