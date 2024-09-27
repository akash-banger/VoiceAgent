-- migrate:up

-- Create the questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automatically update `modified` timestamp on row update
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_questions_modified
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create indexes for better query performance
CREATE INDEX idx_questions_content ON questions(content);

-- migrate:down

-- Drop the index
DROP INDEX IF EXISTS idx_questions_content;

-- Drop the trigger
DROP TRIGGER IF EXISTS update_questions_modified ON questions;

-- Drop the function
DROP FUNCTION IF EXISTS update_modified_column;

-- Drop the questions table
DROP TABLE IF EXISTS questions;