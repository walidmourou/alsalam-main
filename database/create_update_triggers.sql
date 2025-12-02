-- PostgreSQL triggers for automatic updated_at timestamp
-- Run this after creating all tables
-- Create the trigger function (only needs to be created once)
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create triggers for each table with updated_at column
-- Memberships table
CREATE TRIGGER update_memberships_updated_at BEFORE
UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Education requesters table
CREATE TRIGGER update_education_requesters_updated_at BEFORE
UPDATE ON education_requesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Education students table (if it has updated_at)
-- Note: Currently education_students doesn't have updated_at, but adding for future use
-- CREATE TRIGGER update_education_students_updated_at 
-- BEFORE UPDATE ON education_students
-- FOR EACH ROW 
-- EXECUTE FUNCTION update_updated_at_column();
-- Articles table
CREATE TRIGGER update_articles_updated_at BEFORE
UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();