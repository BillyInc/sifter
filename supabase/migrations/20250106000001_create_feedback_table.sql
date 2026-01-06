-- Migration: Create sifter_dev Schema and Feedback Table
-- Description: Sets up the sifter_dev schema and feedback table
-- Created: 2025-01-06
--
-- This migration:
-- 1. Creates a dedicated 'sifter_dev' schema for development
-- 2. Creates the feedback table for collecting user opinions
-- 3. Sets up Row Level Security policies

-- ============================================
-- CREATE SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS sifter_dev;

-- Grant usage to authenticated and anonymous users
GRANT USAGE ON SCHEMA sifter_dev TO anon, authenticated;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA sifter_dev
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA sifter_dev
GRANT SELECT, INSERT ON TABLES TO anon;

-- ============================================
-- CREATE FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sifter_dev.feedback (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Core feedback fields (required)
    dashboard_opinion TEXT NOT NULL,
    improvements TEXT NOT NULL,
    would_use VARCHAR(10) NOT NULL CHECK (would_use IN ('yes', 'no', 'maybe')),
    solves_problem TEXT NOT NULL,

    -- Referral fields (optional)
    referral_name TEXT,
    referral_twitter VARCHAR(100),

    -- Contact info (optional)
    email VARCHAR(255),

    -- Metadata
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    source VARCHAR(50) DEFAULT 'web',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at
    ON sifter_dev.feedback(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_would_use
    ON sifter_dev.feedback(would_use);

CREATE INDEX IF NOT EXISTS idx_feedback_referral_twitter
    ON sifter_dev.feedback(referral_twitter)
    WHERE referral_twitter IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE sifter_dev.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (including anonymous users) to INSERT feedback
CREATE POLICY "Allow public feedback submission"
    ON sifter_dev.feedback
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Only authenticated users can READ feedback
CREATE POLICY "Allow authenticated users to read feedback"
    ON sifter_dev.feedback
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only authenticated users can UPDATE feedback
CREATE POLICY "Allow authenticated users to update feedback"
    ON sifter_dev.feedback
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Only authenticated users can DELETE feedback
CREATE POLICY "Allow authenticated users to delete feedback"
    ON sifter_dev.feedback
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION sifter_dev.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_feedback_updated_at
    BEFORE UPDATE ON sifter_dev.feedback
    FOR EACH ROW
    EXECUTE FUNCTION sifter_dev.handle_updated_at();

-- ============================================
-- COMMENTS (Documentation)
-- ============================================
COMMENT ON SCHEMA sifter_dev IS 'Sifter development schema';
COMMENT ON TABLE sifter_dev.feedback IS 'User feedback submissions from the Sifter dashboard';
COMMENT ON COLUMN sifter_dev.feedback.dashboard_opinion IS 'What users think about the dashboard';
COMMENT ON COLUMN sifter_dev.feedback.improvements IS 'What users want improved';
COMMENT ON COLUMN sifter_dev.feedback.would_use IS 'Whether they would use Sifter when it goes live';
COMMENT ON COLUMN sifter_dev.feedback.solves_problem IS 'Whether it solves an existing problem for them';
COMMENT ON COLUMN sifter_dev.feedback.referral_name IS 'Name of someone who might benefit from Sifter';
COMMENT ON COLUMN sifter_dev.feedback.referral_twitter IS 'Twitter handle of the referral (without @)';
COMMENT ON COLUMN sifter_dev.feedback.source IS 'Where the feedback was submitted from (web, api)';
