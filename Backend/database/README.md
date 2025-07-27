# Sahayak Educational Platform - Database Design Documentation

## 📊 **Complete Database Architecture**

This document provides a comprehensive overview of the PostgreSQL database design for the Sahayak educational platform, including all tables, relationships, and implementation details.

## 🏗️ **Database Schema Overview**

### **Core Components:**
1. **User Management** - Authentication, profiles, sessions
2. **Content Generation** - ELI5, Stories, Visual Aids, Games, Lesson Plans
3. **Fluency Assessment** - Audio assessments and results
4. **Community Features** - Content sharing, reviews, moderation
5. **File Storage** - Media and document management
6. **System Configuration** - Settings and audit trails

## 📋 **Table Structure Summary**

### **1. User Management Tables**

#### `users` - Main user profiles
- **Purpose**: Store teacher profiles and authentication data
- **Key Fields**: email, password_hash, name, school_info, grade_levels, subjects
- **Relationships**: One-to-many with all content tables

#### `user_sessions` - Active user sessions
- **Purpose**: Manage JWT tokens and session security
- **Key Fields**: session_token, refresh_token, expires_at, ip_address

#### `password_reset_tokens` - Password reset functionality
- **Purpose**: Secure password reset workflow
- **Key Fields**: token, expires_at, used_at

### **2. Content Generation Tables**

#### `eli5_explanations` - ELI5 explanations
- **Purpose**: Store AI-generated simple explanations
- **Key Fields**: topic, explanation, grade_level, complexity_level, language

#### `stories` - Educational stories
- **Purpose**: Store AI-generated educational stories
- **Key Fields**: title, story_content, characters, theme, moral_lesson

#### `visual_aids` - Visual learning materials
- **Purpose**: Store AI-generated images and visual aids
- **Key Fields**: image_url, image_prompt, complexity, style, include_labels

#### `educational_games` - Interactive games
- **Purpose**: Store AI-generated HTML games
- **Key Fields**: html_code, game_type, difficulty, play_count

#### `lesson_plans` - Weekly lesson plans
- **Purpose**: Store comprehensive lesson plans
- **Key Fields**: plan_content, learning_objectives, materials_needed

### **3. Fluency Assessment Tables**

#### `fluency_assessments` - Audio assessments
- **Purpose**: Store student reading assessments
- **Key Fields**: student_name, assessment_text, audio_file_url, audio_duration

#### `fluency_results` - Assessment results
- **Purpose**: Store AI analysis results
- **Key Fields**: reading_speed_wpm, accuracy_percentage, fluency_score, feedback

### **4. Community Features Tables**

#### `shared_content` - Community sharing
- **Purpose**: Enable content sharing between teachers
- **Key Fields**: content_type, content_id, approval_status, view_count

#### `content_categories` - Content organization
- **Purpose**: Categorize shared content
- **Key Fields**: name, description, icon, color

#### `content_reviews` - User reviews
- **Purpose**: Allow teachers to review shared content
- **Key Fields**: rating, review_text, is_helpful_count

## 🔧 **Implementation Files**

### **Database Setup**
```bash
Backend/database/
├── schema.sql          # Complete database schema
├── sample_data.sql     # Sample data for testing
├── models.py          # SQLAlchemy ORM models
├── config.py          # Database configuration
└── content_manager.py # Content CRUD operations
```

### **Authentication System**
```bash
Backend/auth/
├── auth_manager.py    # Authentication logic
└── routes.py         # Authentication API routes
```

### **Frontend Integration**
```bash
sahayak-frontend/src/contexts/
└── AuthContext.jsx   # React authentication context
```

## 🚀 **Setup Instructions**

### **1. Database Setup (Google Cloud SQL)**

#### Create Cloud SQL Instance:
```bash
gcloud sql instances create sahayak-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=asia-south1 \
    --storage-size=10GB \
    --storage-type=SSD
```

#### Create Database:
```bash
gcloud sql databases create sahayak_production \
    --instance=sahayak-db
```

#### Create User:
```bash
gcloud sql users create sahayak_user \
    --instance=sahayak-db \
    --password=your-secure-password
```

### **2. Environment Configuration**

Create `.env` file in Backend directory:
```env
# Database Configuration
ENVIRONMENT=production
DB_USER=sahayak_user
DB_PASSWORD=your-secure-password
DB_NAME=sahayak_production
DB_HOST=your-cloud-sql-ip
DB_PORT=5432
DB_SSL=true

# Authentication
JWT_SECRET_KEY=your-jwt-secret-key
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=30

# Google Cloud
GOOGLE_CLOUD_SQL_INSTANCE=project:region:instance
```

### **3. Database Initialization**

```python
# Run in Python environment
from database.config import initialize_database
from database.models import Base

# Initialize database
success = initialize_database()
if success:
    print("Database initialized successfully!")
```

### **4. Load Sample Data**

```bash
# Connect to your database and run:
psql -h your-db-host -U sahayak_user -d sahayak_production -f Backend/database/sample_data.sql
```

## 🔐 **Authentication Integration**

### **Backend Routes**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### **Frontend Integration**
```javascript
// Example usage in React components
import { useAuth } from '../contexts/AuthContext'

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth()
  
  // Use authentication state and methods
}
```

## 📊 **Content Management Integration**

### **Save Content to Database**
```python
from database.content_manager import content_manager

# Save ELI5 explanation
success, message, data = content_manager.save_eli5_explanation(
    user_id="user-uuid",
    explanation_data={
        "topic": "What is photosynthesis?",
        "explanation": "Plants make food using sunlight...",
        "grade_level": "3",
        "subject": "Science"
    }
)
```

### **Retrieve User Content**
```python
# Get user's content
eli5_explanations = content_manager.get_eli5_explanations(user_id="user-uuid")
stories = content_manager.get_stories(user_id="user-uuid")
visual_aids = content_manager.get_visual_aids(user_id="user-uuid")
```

## 🔍 **Key Features**

### **1. Scalable Architecture**
- UUID primary keys for distributed systems
- Proper indexing for performance
- JSONB fields for flexible metadata storage

### **2. Security**
- Bcrypt password hashing
- JWT token authentication
- Session management with expiration
- SQL injection prevention through ORM

### **3. Data Integrity**
- Foreign key constraints
- Check constraints for data validation
- Automatic timestamp updates
- Audit trail for all changes

### **4. Performance Optimization**
- Strategic indexes on frequently queried fields
- Connection pooling configuration
- Query optimization through ORM

### **5. Community Features**
- Content sharing and discovery
- Rating and review system
- Content moderation workflow
- Activity tracking

## 📈 **Migration Strategy**

### **From Mock Data to Database**

1. **Phase 1**: Set up database and authentication
2. **Phase 2**: Migrate existing AI generation features
3. **Phase 3**: Implement community features
4. **Phase 4**: Add advanced analytics and reporting

### **Data Migration Script**
```python
# Example migration for existing content
def migrate_existing_content():
    # Read existing mock data
    # Transform to database format
    # Insert into appropriate tables
    pass
```

## 🛠️ **Maintenance**

### **Regular Tasks**
- Clean up expired sessions: `auth_manager.cleanup_expired_sessions()`
- Database backups: Automated through Google Cloud SQL
- Monitor performance: Use Cloud SQL insights
- Update indexes: Based on query patterns

### **Monitoring**
- Database connection health
- Query performance metrics
- Storage usage tracking
- User activity analytics

## 📞 **Support**

For implementation questions or issues:
1. Check the database logs in Google Cloud Console
2. Review the SQLAlchemy ORM documentation
3. Test with sample data first
4. Use the provided utility functions

This database design provides a solid foundation for the Sahayak platform with room for future growth and feature additions.
