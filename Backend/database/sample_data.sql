-- =====================================================
-- SAHAYAK PLATFORM - SAMPLE DATA
-- Insert sample data for testing and development
-- =====================================================

-- Sample Users (Teachers)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, school_name, district, state, grade_levels, subjects, experience_years, bio, is_verified) VALUES
(uuid_generate_v4(), 'priya.sharma@school.edu', crypt('password123', gen_salt('bf')), 'Priya', 'Sharma', '+91-9876543210', 'Delhi Public School', 'New Delhi', 'Delhi', ARRAY['1', '2', '3'], ARRAY['English', 'Hindi'], 8, 'Passionate about early childhood education and literacy development.', true),
(uuid_generate_v4(), 'rajesh.kumar@school.edu', crypt('password123', gen_salt('bf')), 'Rajesh', 'Kumar', '+91-9876543211', 'Kendriya Vidyalaya', 'Mumbai', 'Maharashtra', ARRAY['3', '4', '5'], ARRAY['Mathematics', 'Science'], 12, 'Mathematics teacher with focus on making complex concepts simple for young minds.', true),
(uuid_generate_v4(), 'anita.patel@school.edu', crypt('password123', gen_salt('bf')), 'Anita', 'Patel', '+91-9876543212', 'Sarvodaya School', 'Ahmedabad', 'Gujarat', ARRAY['1', '2'], ARRAY['English', 'Art'], 5, 'Creative educator specializing in visual learning and storytelling.', true),
(uuid_generate_v4(), 'admin@sahayak.edu', crypt('admin123', gen_salt('bf')), 'System', 'Administrator', '+91-9876543213', 'Sahayak Platform', 'Bangalore', 'Karnataka', ARRAY[], ARRAY[], 0, 'Platform administrator', true);

-- Sample Content Categories
INSERT INTO content_categories (id, name, description, icon, color, sort_order) VALUES
(uuid_generate_v4(), 'Mathematics', 'Mathematical concepts and problem solving', 'calculator', '#3B82F6', 1),
(uuid_generate_v4(), 'Science', 'Scientific concepts and experiments', 'microscope', '#10B981', 2),
(uuid_generate_v4(), 'English', 'Language arts and literature', 'book-open', '#8B5CF6', 3),
(uuid_generate_v4(), 'Hindi', 'Hindi language and literature', 'type', '#F59E0B', 4),
(uuid_generate_v4(), 'Social Studies', 'History, geography, and civics', 'globe', '#EF4444', 5),
(uuid_generate_v4(), 'Art & Craft', 'Creative activities and projects', 'palette', '#EC4899', 6);

-- Sample Content Tags
INSERT INTO content_tags (name, description, usage_count) VALUES
('grade-1', 'Content suitable for Grade 1 students', 15),
('grade-2', 'Content suitable for Grade 2 students', 18),
('grade-3', 'Content suitable for Grade 3 students', 22),
('grade-4', 'Content suitable for Grade 4 students', 20),
('grade-5', 'Content suitable for Grade 5 students', 16),
('interactive', 'Interactive learning content', 25),
('visual', 'Visual learning aids', 30),
('storytelling', 'Story-based learning', 12),
('hands-on', 'Hands-on activities', 18),
('assessment', 'Assessment and evaluation tools', 8),
('hindi-medium', 'Content in Hindi language', 14),
('english-medium', 'Content in English language', 35),
('ncert-aligned', 'Aligned with NCERT curriculum', 28),
('cbse-pattern', 'Following CBSE pattern', 22),
('beginner-friendly', 'Suitable for beginners', 20);

-- Sample ELI5 Explanations
INSERT INTO eli5_explanations (user_id, topic, grade_level, subject, explanation, complexity_level, language, word_count, reading_time_minutes, is_public, view_count, like_count) VALUES
((SELECT id FROM users WHERE email = 'priya.sharma@school.edu'), 'What is Addition?', '1', 'Mathematics', 'Addition means putting things together! Imagine you have 2 apples and your friend gives you 3 more apples. Now you count all the apples together: 1, 2, 3, 4, 5! So 2 + 3 = 5. Addition is like collecting things to see how many you have in total. We use the + sign to show addition, just like a plus sign means "add more"!', 'simple', 'en', 65, 2, true, 45, 12),
((SELECT id FROM users WHERE email = 'rajesh.kumar@school.edu'), 'Why do Plants Need Sunlight?', '3', 'Science', 'Plants are like little food factories! They make their own food using sunlight, water, and air. The green parts of plants (called leaves) catch sunlight like solar panels. They mix sunlight with water from roots and carbon dioxide from air to make sugar - that''s their food! This process is called photosynthesis. Without sunlight, plants can''t make food and they become weak and die, just like how we need food to stay strong!', 'moderate', 'en', 78, 3, true, 67, 18),
((SELECT id FROM users WHERE email = 'anita.patel@school.edu'), 'What are Rhyming Words?', '2', 'English', 'Rhyming words are words that sound the same at the end! Like "cat" and "hat" - they both end with the "at" sound. Or "sun" and "fun" - they both end with "un". When we say poems or sing songs, we often use rhyming words because they sound nice together. Try this: can you think of words that rhyme with "dog"? How about "log" or "frog"? Rhyming makes language fun and helps us remember things better!', 'simple', 'en', 82, 3, true, 38, 9);

-- Sample Stories
INSERT INTO stories (user_id, title, theme, characters, grade_level, subject, moral_lesson, story_content, language, word_count, estimated_reading_time, is_public, view_count, like_count) VALUES
((SELECT id FROM users WHERE email = 'priya.sharma@school.edu'), 'The Helpful Little Ant', 'Helping Others', ARRAY['Annie the Ant', 'Benny the Beetle', 'Wise Old Owl'], '1', 'English', 'Small acts of kindness can make a big difference', 'Once upon a time, there lived a little ant named Annie. She was very small but had a big heart. One day, she saw Benny the Beetle stuck under a heavy leaf. "Help! Help!" cried Benny. Annie was much smaller than Benny, but she didn''t give up. She called all her ant friends, and together they lifted the leaf. Benny was free! "Thank you, Annie!" said Benny. "You may be small, but you have a big heart!" From that day, Annie learned that even the smallest person can help others in big ways.', 'en', 95, 4, true, 78, 23),
((SELECT id FROM users WHERE email = 'anita.patel@school.edu'), 'The Magic Paintbrush', 'Creativity', ARRAY['Maya', 'Magic Paintbrush', 'Village Children'], '2', 'Art', 'Creativity and sharing bring joy to everyone', 'Maya found an old paintbrush in her grandmother''s attic. When she dipped it in water and painted on paper, something magical happened - her drawings came to life! She painted a butterfly, and it flew around the room. She painted flowers, and they smelled wonderful. Maya was so excited! She decided to share this magic with her friends. Together, they painted a beautiful garden that made their whole village colorful and happy. Maya learned that magic is even more wonderful when shared with others.', 'en', 87, 4, true, 56, 15);

-- Sample System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('platform_name', 'Sahayak - AI Teaching Assistant', 'string', 'Name of the platform', true),
('supported_grades', '["K", "1", "2", "3", "4", "5"]', 'json', 'List of supported grade levels', true),
('supported_subjects', '["Mathematics", "Science", "English", "Hindi", "Social Studies", "Art"]', 'json', 'List of supported subjects', true),
('max_file_size_mb', '50', 'integer', 'Maximum file upload size in MB', false),
('session_timeout_hours', '24', 'integer', 'User session timeout in hours', false),
('enable_community_features', 'true', 'boolean', 'Enable community sharing features', true),
('default_language', 'en', 'string', 'Default platform language', true),
('content_moderation_enabled', 'true', 'boolean', 'Enable content moderation', false);

-- Sample Fluency Assessment (for demonstration)
-- Note: In real usage, these would be created through the application
DO $$
DECLARE
    sample_user_id UUID;
    sample_assessment_id UUID;
BEGIN
    -- Get a sample user ID
    SELECT id INTO sample_user_id FROM users WHERE email = 'priya.sharma@school.edu';
    
    -- Insert sample fluency assessment
    INSERT INTO fluency_assessments (id, user_id, student_name, grade_level, assessment_text, text_title, text_word_count, audio_duration_seconds, is_custom_text)
    VALUES (uuid_generate_v4(), sample_user_id, 'Rahul Kumar', '2', 'The cat sat on the mat. The cat has a red hat. The hat is big and warm. The cat likes the hat very much.', 'The Cat and the Hat', 24, 18.5, false)
    RETURNING id INTO sample_assessment_id;
    
    -- Insert sample fluency results
    INSERT INTO fluency_results (assessment_id, reading_speed_wpm, accuracy_percentage, fluency_score, pronunciation_score, overall_feedback, improvement_suggestions, processing_status)
    VALUES (sample_assessment_id, 85.5, 92.0, 7.5, 8.0, 'Good reading pace and accuracy. Student shows strong comprehension skills.', 'Focus on pronunciation of longer words. Practice reading with more expression.', 'completed');
END $$;

-- Create some sample shared content
DO $$
DECLARE
    sample_user_id UUID;
    sample_eli5_id UUID;
    sample_story_id UUID;
    sample_category_id UUID;
    sample_tag_id UUID;
    sample_shared_content_id UUID;
BEGIN
    -- Get sample IDs
    SELECT id INTO sample_user_id FROM users WHERE email = 'priya.sharma@school.edu';
    SELECT id INTO sample_eli5_id FROM eli5_explanations WHERE topic = 'What is Addition?' LIMIT 1;
    SELECT id INTO sample_story_id FROM stories WHERE title = 'The Helpful Little Ant' LIMIT 1;
    SELECT id INTO sample_category_id FROM content_categories WHERE name = 'Mathematics' LIMIT 1;
    SELECT id INTO sample_tag_id FROM content_tags WHERE name = 'grade-1' LIMIT 1;
    
    -- Share the ELI5 explanation
    INSERT INTO shared_content (id, user_id, content_type, content_id, title, description, category_id, grade_levels, subjects, is_featured, view_count, like_count)
    VALUES (uuid_generate_v4(), sample_user_id, 'eli5', sample_eli5_id, 'Simple Addition Explanation for Grade 1', 'Easy-to-understand explanation of addition with examples', sample_category_id, ARRAY['1'], ARRAY['Mathematics'], true, 45, 12)
    RETURNING id INTO sample_shared_content_id;
    
    -- Add tags to shared content
    INSERT INTO content_tag_associations (shared_content_id, tag_id)
    VALUES (sample_shared_content_id, sample_tag_id);
    
    -- Add a sample review
    INSERT INTO content_reviews (shared_content_id, user_id, rating, review_text)
    VALUES (sample_shared_content_id, (SELECT id FROM users WHERE email = 'rajesh.kumar@school.edu'), 5, 'Excellent explanation! My students understood addition much better after using this.');
END $$;
