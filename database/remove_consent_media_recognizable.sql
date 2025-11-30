-- Migration to remove consent_media_recognizable column from education_registrations table
ALTER TABLE education_registrations DROP COLUMN consent_media_recognizable;