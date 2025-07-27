-- =====================================================
-- SAHAYAK EDUCATIONAL PLATFORM - DATABASE SCHEMA
-- PostgreSQL 15+ Compatible
-- Designed for Google Cloud SQL
-- =====================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USER MANAGEMENT TABLES
-- =====================================================

-- Users table (Teachers and Administrators)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'moderator')),
    school_name VARCHAR(200),
    district VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'India',
    grade_levels TEXT[], -- Array of grades they teach (e.g., ['1', '2', '3'])
    subjects TEXT[], -- Array of subjects (e.g., ['Math', 'Science', 'English'])
    experience_years INTEGER,
    profile_image_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CONTENT GENERATION TABLES
-- =====================================================

-- ELI5 Explanations
CREATE TABLE eli5_explanations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(500) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    subject VARCHAR(100),
    explanation TEXT NOT NULL,
    complexity_level VARCHAR(20) DEFAULT 'simple' CHECK (complexity_level IN ('simple', 'moderate', 'detailed')),
    language VARCHAR(10) DEFAULT 'en',
    word_count INTEGER,
    reading_time_minutes INTEGER,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Generation
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    theme VARCHAR(100),
    characters TEXT[], -- Array of character names
    grade_level VARCHAR(10) NOT NULL,
    subject VARCHAR(100),
    moral_lesson VARCHAR(500),
    story_content TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    word_count INTEGER,
    estimated_reading_time INTEGER,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visual Aid Generation
CREATE TABLE visual_aids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(300) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    complexity VARCHAR(20) DEFAULT 'simple',
    color_scheme VARCHAR(50),
    style VARCHAR(50),
    size VARCHAR(20),
    include_labels BOOLEAN DEFAULT true,
    include_explanation BOOLEAN DEFAULT true,
    image_url TEXT, -- URL to generated image
    image_prompt TEXT, -- Original prompt used for generation
    generation_metadata JSONB, -- Additional metadata from AI generation
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Educational Games
CREATE TABLE educational_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(300) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    theme VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'medium',
    duration VARCHAR(20) DEFAULT 'medium',
    game_type VARCHAR(50), -- quiz, puzzle, matching, etc.
    html_code TEXT NOT NULL, -- Complete HTML game code
    design_document TEXT, -- Game design documentation
    play_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly Lesson Plans
CREATE TABLE lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    week_number INTEGER,
    academic_year VARCHAR(10), -- e.g., "2024-25"
    curriculum_standard VARCHAR(100),
    learning_objectives TEXT[],
    plan_content TEXT NOT NULL, -- Complete lesson plan content
    materials_needed TEXT[],
    assessment_methods TEXT[],
    homework_assignments TEXT[],
    duration_minutes INTEGER,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. AUDIO FLUENCY ASSESSMENT TABLES
-- =====================================================

-- Fluency Assessments
CREATE TABLE fluency_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(200) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    assessment_text TEXT NOT NULL,
    text_title VARCHAR(300),
    text_word_count INTEGER,
    audio_file_url TEXT, -- URL to stored audio file
    audio_duration_seconds DECIMAL(8,2),
    audio_file_size_bytes BIGINT,
    assessment_date DATE DEFAULT CURRENT_DATE,
    is_custom_text BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fluency Assessment Results
CREATE TABLE fluency_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES fluency_assessments(id) ON DELETE CASCADE,
    reading_speed_wpm DECIMAL(6,2), -- Words per minute
    accuracy_percentage DECIMAL(5,2), -- Accuracy percentage
    fluency_score DECIMAL(4,2), -- Overall fluency score (0-10)
    pronunciation_score DECIMAL(4,2), -- Pronunciation score (0-10)
    overall_feedback TEXT,
    improvement_suggestions TEXT,
    detailed_analysis JSONB, -- Detailed analysis data
    processing_status VARCHAR(20) DEFAULT 'completed' CHECK (processing_status IN ('processing', 'completed', 'failed')),
    processing_time_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. COMMUNITY FEATURES TABLES
-- =====================================================

-- Content Categories
CREATE TABLE content_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    parent_category_id UUID REFERENCES content_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Tags
CREATE TABLE content_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Sharing (Generic table for all shared content)
CREATE TABLE shared_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('eli5', 'story', 'visual_aid', 'game', 'lesson_plan')),
    content_id UUID NOT NULL, -- References the specific content table
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES content_categories(id),
    grade_levels TEXT[], -- Array of applicable grade levels
    subjects TEXT[], -- Array of applicable subjects
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Tag Associations (Many-to-many relationship)
CREATE TABLE content_tag_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shared_content_id, tag_id)
);

-- Content Ratings and Reviews
CREATE TABLE content_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_helpful_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT false,
    flagged_reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shared_content_id, user_id) -- One review per user per content
);

-- Content Likes/Favorites
CREATE TABLE content_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shared_content_id, user_id)
);

-- User Activity Tracking
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'create', 'view', 'like', 'share', 'download', etc.
    content_type VARCHAR(50), -- 'eli5', 'story', 'visual_aid', etc.
    content_id UUID, -- References the specific content
    shared_content_id UUID REFERENCES shared_content(id),
    metadata JSONB, -- Additional activity data
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Moderation Queue
CREATE TABLE moderation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES users(id),
    moderator_notes TEXT,
    action_taken VARCHAR(100),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. FILE STORAGE REFERENCES
-- =====================================================

-- File Storage (for images, audio, PDFs, etc.)
CREATE TABLE file_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(500) NOT NULL,
    stored_filename VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL, -- MIME type
    file_size_bytes BIGINT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'google_cloud', -- 'google_cloud', 'aws_s3', 'local'
    bucket_name VARCHAR(200),
    content_type VARCHAR(50), -- 'image', 'audio', 'document', etc.
    related_content_type VARCHAR(50), -- What type of content this file belongs to
    related_content_id UUID, -- ID of the related content
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. SYSTEM CONFIGURATION TABLES
-- =====================================================

-- System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'integer', 'boolean', 'json'
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether this setting can be accessed by frontend
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school ON users(school_name);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Session indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Content indexes
CREATE INDEX idx_eli5_user_id ON eli5_explanations(user_id);
CREATE INDEX idx_eli5_grade_level ON eli5_explanations(grade_level);
CREATE INDEX idx_eli5_subject ON eli5_explanations(subject);
CREATE INDEX idx_eli5_public ON eli5_explanations(is_public);
CREATE INDEX idx_eli5_created_at ON eli5_explanations(created_at);

CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_grade_level ON stories(grade_level);
CREATE INDEX idx_stories_subject ON stories(subject);
CREATE INDEX idx_stories_public ON stories(is_public);
CREATE INDEX idx_stories_created_at ON stories(created_at);

CREATE INDEX idx_visual_aids_user_id ON visual_aids(user_id);
CREATE INDEX idx_visual_aids_grade_level ON visual_aids(grade_level);
CREATE INDEX idx_visual_aids_subject ON visual_aids(subject);
CREATE INDEX idx_visual_aids_public ON visual_aids(is_public);

CREATE INDEX idx_games_user_id ON educational_games(user_id);
CREATE INDEX idx_games_grade_level ON educational_games(grade_level);
CREATE INDEX idx_games_subject ON educational_games(subject);
CREATE INDEX idx_games_public ON educational_games(is_public);

CREATE INDEX idx_lesson_plans_user_id ON lesson_plans(user_id);
CREATE INDEX idx_lesson_plans_grade_level ON lesson_plans(grade_level);
CREATE INDEX idx_lesson_plans_subject ON lesson_plans(subject);
CREATE INDEX idx_lesson_plans_public ON lesson_plans(is_public);

-- Fluency assessment indexes
CREATE INDEX idx_fluency_assessments_user_id ON fluency_assessments(user_id);
CREATE INDEX idx_fluency_assessments_student ON fluency_assessments(student_name);
CREATE INDEX idx_fluency_assessments_grade ON fluency_assessments(grade_level);
CREATE INDEX idx_fluency_assessments_date ON fluency_assessments(assessment_date);

CREATE INDEX idx_fluency_results_assessment_id ON fluency_results(assessment_id);
CREATE INDEX idx_fluency_results_status ON fluency_results(processing_status);

-- Community indexes
CREATE INDEX idx_shared_content_user_id ON shared_content(user_id);
CREATE INDEX idx_shared_content_type ON shared_content(content_type);
CREATE INDEX idx_shared_content_category ON shared_content(category_id);
CREATE INDEX idx_shared_content_approved ON shared_content(is_approved);
CREATE INDEX idx_shared_content_featured ON shared_content(is_featured);
CREATE INDEX idx_shared_content_created_at ON shared_content(created_at);

CREATE INDEX idx_content_reviews_content_id ON content_reviews(shared_content_id);
CREATE INDEX idx_content_reviews_user_id ON content_reviews(user_id);
CREATE INDEX idx_content_reviews_rating ON content_reviews(rating);

CREATE INDEX idx_content_likes_content_id ON content_likes(shared_content_id);
CREATE INDEX idx_content_likes_user_id ON content_likes(user_id);

-- Activity tracking indexes
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_content_type ON user_activities(content_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- File storage indexes
CREATE INDEX idx_file_storage_user_id ON file_storage(user_id);
CREATE INDEX idx_file_storage_content_type ON file_storage(content_type);
CREATE INDEX idx_file_storage_related_content ON file_storage(related_content_type, related_content_id);

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eli5_updated_at BEFORE UPDATE ON eli5_explanations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visual_aids_updated_at BEFORE UPDATE ON visual_aids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON educational_games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_plans_updated_at BEFORE UPDATE ON lesson_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fluency_assessments_updated_at BEFORE UPDATE ON fluency_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shared_content_updated_at BEFORE UPDATE ON shared_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_reviews_updated_at BEFORE UPDATE ON content_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
