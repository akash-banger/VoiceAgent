-- migrate:up

-- Create the answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    question_id UUID NOT NULL,
    answer_content TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_question
        FOREIGN KEY (question_id)
        REFERENCES questions (id)
        ON DELETE CASCADE,
    CONSTRAINT unique_user_question
        UNIQUE (user_id, question_id) -- Ensures a user can answer a question only once
);

-- Automatically update `date_modified` timestamp on row update
CREATE OR REPLACE FUNCTION update_answers_date_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.date_modified = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_answers_date_modified
BEFORE UPDATE ON answers
FOR EACH ROW
EXECUTE FUNCTION update_answers_date_modified_column();

-- Create indexes for better query performance
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- migrate:down

-- Drop indexes
DROP INDEX IF EXISTS idx_answers_user_id;
DROP INDEX IF EXISTS idx_answers_question_id;

-- Drop the trigger
DROP TRIGGER IF EXISTS update_answers_date_modified ON answers;

-- Drop the function
DROP FUNCTION IF EXISTS update_answers_date_modified_column;

-- Drop the answers table
DROP TABLE IF EXISTS answers;