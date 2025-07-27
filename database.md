# Sahayak Application Database Design Specification

## Executive Summary

This document provides a comprehensive PostgreSQL database schema for the Sahayak application - a mobile-first React web application designed for Indian government school teachers. The database supports AI-powered teaching aids, differentiated worksheets, community content sharing, and offline synchronization capabilities.

### Key Features Supported:
- Teacher authentication and profile management
- AI-powered content generation (stories, worksheets, visual aids, assessments)
- Multi-grade worksheet generation with file upload support
- Community content sharing and curation
- Student progress tracking and assessments
- Offline capability with sync queuing
- PDF export and content management

---

## Database Tables Overview

### Core Tables:
1. **users** - Teacher profiles and authentication
2. **schools** - School information and metadata
3. **subjects** - Academic subjects and curriculum data
4. **grades** - Grade levels and age ranges

### Content Generation Tables:
5. **worksheets** - Generated worksheet metadata
6. **worksheet_questions** - Individual questions within worksheets
7. **stories** - Generated story content
8. **visual_aids** - Visual aid content and metadata
9. **assessments** - Assessment sessions and metadata
10. **lesson_plans** - Generated lesson plans
11. **eli5_explanations** - Simplified explanations content

### File Management Tables:
12. **uploaded_files** - File uploads and metadata
13. **generated_pdfs** - PDF export tracking

### Community & Sharing Tables:
14. **community_posts** - Shared content in community
15. **post_likes** - User likes on community posts
16. **post_comments** - Comments on community posts
17. **content_tags** - Tags for content categorization

### Assessment & Progress Tables:
18. **student_assessments** - Individual student assessment records
19. **assessment_recordings** - Audio recordings for reading assessments
20. **progress_tracking** - Student progress over time

### System Tables:
21. **sync_queue** - Offline synchronization queue
22. **user_sessions** - Authentication sessions
23. **app_settings** - Application configuration
24. **audit_logs** - System activity logging

---

## Detailed Table Schemas

### 1. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    school_id UUID REFERENCES schools(id),
    onboarding_complete BOOLEAN DEFAULT FALSE,
    profile_picture_url TEXT,
    location VARCHAR(255),
    teaching_experience INTEGER, -- years
    preferred_language VARCHAR(10) DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_school ON users(school_id);
```

### 2. schools
```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'government', 'private', 'aided'
    address TEXT,
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    udise_code VARCHAR(20) UNIQUE, -- Unified District Information System for Education
    principal_name VARCHAR(100),
    contact_phone VARCHAR(15),
    total_students INTEGER,
    total_teachers INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_district ON schools(district);
CREATE INDEX idx_schools_state ON schools(state);
```

### 3. subjects
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- 'MATH', 'ENG', 'SCI', etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subjects (name, code, description) VALUES
('Mathematics', 'MATH', 'Mathematical concepts and problem solving'),
('English', 'ENG', 'English language and literature'),
('Science', 'SCI', 'General science concepts'),
('Social Studies', 'SST', 'History, geography, and civics'),
('Hindi', 'HIN', 'Hindi language and literature'),
('Environmental Studies', 'EVS', 'Environmental awareness and studies');
```

### 4. grades
```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL UNIQUE, -- 1, 2, 3, 4, 5, 6, 7, 8
    name VARCHAR(50) NOT NULL, -- 'Grade 1', 'Grade 2', etc.
    age_range VARCHAR(20), -- '6-7', '7-8', etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO grades (level, name, age_range, description) VALUES
(1, 'Grade 1', '6-7', 'First grade elementary'),
(2, 'Grade 2', '7-8', 'Second grade elementary'),
(3, 'Grade 3', '8-9', 'Third grade elementary'),
(4, 'Grade 4', '9-10', 'Fourth grade elementary'),
(5, 'Grade 5', '10-11', 'Fifth grade elementary'),
(6, 'Grade 6', '11-12', 'Sixth grade middle school'),
(7, 'Grade 7', '12-13', 'Seventh grade middle school'),
(8, 'Grade 8', '13-14', 'Eighth grade middle school');
```

### 5. user_subjects
```sql
CREATE TABLE user_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, subject_id)
);

CREATE INDEX idx_user_subjects_user ON user_subjects(user_id);
```

### 6. user_grades
```sql
CREATE TABLE user_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, grade_id)
);

CREATE INDEX idx_user_grades_user ON user_grades(user_id);
```

### 7. worksheets
```sql
CREATE TABLE worksheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    topic VARCHAR(255) NOT NULL,
    grade_levels INTEGER[] NOT NULL, -- Array of grade levels [3,4,5]
    difficulty_levels VARCHAR(20)[] NOT NULL, -- ['easy', 'medium', 'hard']
    question_types VARCHAR(50)[] NOT NULL, -- ['multiple-choice', 'short-answer', etc.]
    question_count INTEGER NOT NULL,
    time_limit INTEGER, -- in minutes
    format_type VARCHAR(20) DEFAULT 'mixed', -- 'mixed', 'grouped', 'progressive'
    include_instructions BOOLEAN DEFAULT TRUE,
    include_answer_key BOOLEAN DEFAULT TRUE,
    include_local_examples BOOLEAN DEFAULT TRUE,
    extracted_content TEXT, -- Content from uploaded files
    total_points INTEGER,
    is_shared BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worksheets_user ON worksheets(user_id);
CREATE INDEX idx_worksheets_subject ON worksheets(subject_id);
CREATE INDEX idx_worksheets_shared ON worksheets(is_shared);
CREATE INDEX idx_worksheets_created ON worksheets(created_at);
```

### 8. worksheet_questions
```sql
CREATE TABLE worksheet_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worksheet_id UUID NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'multiple-choice', 'short-answer', 'true-false', 'fill-blank'
    difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
    grade_level INTEGER NOT NULL,
    options JSONB, -- For multiple choice: ["Option A", "Option B", "Option C", "Option D"]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worksheet_questions_worksheet ON worksheet_questions(worksheet_id);
CREATE INDEX idx_worksheet_questions_type ON worksheet_questions(question_type);
```

### 9. stories
```sql
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL,
    story_length VARCHAR(20) NOT NULL, -- 'short', 'medium', 'long'
    story_type VARCHAR(50) NOT NULL, -- 'moral', 'adventure', 'educational', 'folktale'
    characters VARCHAR(100)[] NOT NULL, -- Array of character names
    setting VARCHAR(100) NOT NULL,
    local_context VARCHAR(255),
    moral_lesson TEXT,
    content TEXT NOT NULL,
    word_count INTEGER,
    reading_time VARCHAR(20), -- '2-3 minutes'
    language VARCHAR(20) DEFAULT 'english',
    include_dialogue BOOLEAN DEFAULT TRUE,
    include_questions BOOLEAN DEFAULT TRUE,
    discussion_questions TEXT[],
    vocabulary JSONB, -- [{"word": "adventure", "meaning": "exciting journey"}]
    is_shared BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_grade ON stories(grade_level);
CREATE INDEX idx_stories_type ON stories(story_type);
CREATE INDEX idx_stories_shared ON stories(is_shared);
```

### 10. visual_aids
```sql
CREATE TABLE visual_aids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    topic VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL,
    aid_type VARCHAR(50) NOT NULL, -- 'diagram', 'chart', 'illustration', 'concept-map'
    description TEXT,
    content_data JSONB, -- Structured data for the visual aid
    image_url TEXT, -- Generated or uploaded image
    instructions TEXT, -- How to use the visual aid
    materials_needed TEXT[], -- Required materials
    is_shared BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visual_aids_user ON visual_aids(user_id);
CREATE INDEX idx_visual_aids_subject ON visual_aids(subject_id);
CREATE INDEX idx_visual_aids_type ON visual_aids(aid_type);
```

### 11. assessments
```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL,
    text_type VARCHAR(50) NOT NULL, -- 'story', 'passage', 'poem'
    difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
    selected_text TEXT,
    custom_text TEXT,
    assessment_duration INTEGER, -- in seconds
    recording_url TEXT, -- Audio recording file path
    transcription TEXT, -- Speech-to-text result
    fluency_score DECIMAL(5,2), -- 0.00 to 100.00
    accuracy_score DECIMAL(5,2),
    comprehension_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    feedback TEXT,
    areas_for_improvement TEXT[],
    strengths TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_student ON assessments(student_name);
CREATE INDEX idx_assessments_grade ON assessments(grade_level);
CREATE INDEX idx_assessments_date ON assessments(created_at);
```

### 12. lesson_plans
```sql
CREATE TABLE lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    topic VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    objectives TEXT[] NOT NULL,
    materials_needed TEXT[],
    lesson_structure JSONB, -- Structured lesson plan data
    activities JSONB, -- Array of activities with details
    assessment_methods TEXT[],
    homework_assignments TEXT[],
    notes TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_plans_user ON lesson_plans(user_id);
CREATE INDEX idx_lesson_plans_subject ON lesson_plans(subject_id);
CREATE INDEX idx_lesson_plans_grade ON lesson_plans(grade_level);
```

### 13. eli5_explanations
```sql
CREATE TABLE eli5_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    original_topic VARCHAR(255) NOT NULL,
    grade_level INTEGER NOT NULL,
    complexity_level VARCHAR(20) NOT NULL, -- 'very-simple', 'simple', 'moderate'
    explanation_text TEXT NOT NULL,
    analogies TEXT[], -- Simple analogies used
    examples TEXT[], -- Real-world examples
    key_concepts TEXT[], -- Main concepts explained
    follow_up_questions TEXT[],
    is_shared BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eli5_user ON eli5_explanations(user_id);
CREATE INDEX idx_eli5_grade ON eli5_explanations(grade_level);
CREATE INDEX idx_eli5_complexity ON eli5_explanations(complexity_level);
```

### 14. uploaded_files
```sql
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'image', 'document'
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- in bytes
    extracted_text TEXT, -- Extracted content from PDF/images
    processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    processing_error TEXT,
    metadata JSONB, -- Additional file metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_uploaded_files_user ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_type ON uploaded_files(file_type);
CREATE INDEX idx_uploaded_files_status ON uploaded_files(processing_status);
```

### 15. worksheet_files
```sql
CREATE TABLE worksheet_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worksheet_id UUID NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(worksheet_id, file_id)
);

CREATE INDEX idx_worksheet_files_worksheet ON worksheet_files(worksheet_id);
```

### 16. generated_pdfs
```sql
CREATE TABLE generated_pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'worksheet', 'story', 'lesson_plan'
    content_id UUID NOT NULL, -- References the specific content
    file_path TEXT NOT NULL,
    file_size BIGINT,
    generation_parameters JSONB, -- Parameters used for PDF generation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_pdfs_user ON generated_pdfs(user_id);
CREATE INDEX idx_generated_pdfs_content ON generated_pdfs(content_type, content_id);
```

### 17. community_posts
```sql
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'worksheet', 'story', 'visual_aid', 'lesson_plan', 'eli5'
    content_id UUID NOT NULL, -- References the specific content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags VARCHAR(50)[],
    grade_levels INTEGER[],
    subject_ids UUID[],
    is_featured BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_type ON community_posts(content_type);
CREATE INDEX idx_community_posts_featured ON community_posts(is_featured);
CREATE INDEX idx_community_posts_created ON community_posts(created_at);
```

### 18. post_likes
```sql
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
```

### 19. post_comments
```sql
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id), -- For nested comments
    comment_text TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_comment_id);
```

### 20. content_tags
```sql
CREATE TABLE content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_tags_name ON content_tags(name);
```

### 21. sync_queue
```sql
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    content_type VARCHAR(50) NOT NULL, -- 'worksheet', 'story', 'assessment', etc.
    content_data JSONB NOT NULL, -- The actual data to sync
    sync_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'syncing', 'completed', 'failed'
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(sync_status);
CREATE INDEX idx_sync_queue_created ON sync_queue(created_at);
```

### 22. user_sessions
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB, -- Device and browser information
    ip_address INET,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
```

### 23. app_settings
```sql
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Whether setting is visible to users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_settings_key ON app_settings(key);
```

### 24. audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'login', 'create_worksheet', 'share_content', etc.
    resource_type VARCHAR(50), -- 'worksheet', 'story', 'user', etc.
    resource_id UUID,
    old_values JSONB, -- Previous state for updates
    new_values JSONB, -- New state for creates/updates
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## Entity Relationship Diagram (ERD) Description

### Core Relationships:

1. **Users → Schools**: Many-to-One
   - Each teacher belongs to one school
   - Schools can have multiple teachers

2. **Users → User_Subjects/User_Grades**: One-to-Many
   - Teachers can teach multiple subjects and grades
   - Junction tables handle many-to-many relationships

3. **Content Generation**: One-to-Many from Users
   - Users create multiple worksheets, stories, visual aids, etc.
   - Each content item belongs to one user

4. **Worksheets → Worksheet_Questions**: One-to-Many
   - Each worksheet contains multiple questions
   - Questions belong to one worksheet

5. **File Management**: Many-to-Many
   - Worksheets can use multiple uploaded files
   - Files can be used in multiple worksheets
   - Junction table: worksheet_files

6. **Community Sharing**: One-to-Many
   - Users create community posts
   - Posts can have multiple likes and comments

7. **Assessment Tracking**: One-to-Many
   - Users conduct multiple assessments
   - Each assessment belongs to one teacher

8. **Sync Queue**: One-to-Many from Users
   - Each user has multiple sync queue items
   - Supports offline functionality

### Key Constraints:

- **Foreign Key Constraints**: Maintain referential integrity
- **Unique Constraints**: Prevent duplicate relationships
- **Check Constraints**: Ensure data validity (grades 1-8, valid difficulty levels)
- **NOT NULL Constraints**: Ensure required fields are populated

### Performance Considerations:

- **Indexes**: Created on frequently queried columns
- **Partitioning**: Consider partitioning large tables by date
- **JSONB**: Used for flexible schema requirements
- **UUID**: Used for primary keys to support distributed systems

---

## Implementation Notes

### 1. Database Setup
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database
CREATE DATABASE sahayak_db;

-- Set timezone
SET timezone = 'Asia/Kolkata';
```

### 2. Initial Data Population
- Populate subjects and grades tables with standard curriculum data
- Create default app settings
- Set up content tags for common topics

### 3. Security Considerations
- Use row-level security (RLS) for user data isolation
- Implement proper authentication and authorization
- Encrypt sensitive data at rest
- Use prepared statements to prevent SQL injection

### 4. Backup and Maintenance
- Regular automated backups
- Monitor query performance
- Implement data archiving for old records
- Regular VACUUM and ANALYZE operations

This database design provides a robust foundation for the Sahayak application, supporting all core features while maintaining scalability and performance.
```
```
```
```
```
