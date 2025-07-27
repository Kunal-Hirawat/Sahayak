#!/usr/bin/env python3
"""
Migration script to integrate PostgreSQL database with existing Sahayak app.py
This script updates the Flask application to use the new database backend.
"""

import os
import sys
import shutil
from datetime import datetime

def backup_existing_files():
    """Create backup of existing files before migration"""
    backup_dir = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    
    files_to_backup = [
        'app.py',
        'requirements.txt'
    ]
    
    for file in files_to_backup:
        if os.path.exists(file):
            shutil.copy2(file, os.path.join(backup_dir, file))
            print(f"✅ Backed up {file} to {backup_dir}/")
    
    return backup_dir

def update_requirements():
    """Update requirements.txt with database dependencies"""
    new_requirements = [
        "# Database dependencies",
        "sqlalchemy>=2.0.0",
        "psycopg2-binary>=2.9.0",
        "alembic>=1.12.0",
        "",
        "# Authentication dependencies", 
        "pyjwt>=2.8.0",
        "bcrypt>=4.0.0",
        "",
        "# Existing dependencies (keep these)",
        "flask>=2.3.0",
        "flask-cors>=4.0.0",
        "requests>=2.31.0",
        "python-dotenv>=1.0.0",
        "google-generativeai>=0.3.0",
        "pydub>=0.25.0",
        "speechrecognition>=3.10.0",
        "pillow>=10.0.0",
        "reportlab>=4.0.0"
    ]
    
    with open('requirements.txt', 'w') as f:
        f.write('\n'.join(new_requirements))
    
    print("✅ Updated requirements.txt with database dependencies")

def create_env_template():
    """Create .env template file"""
    env_template = """# Sahayak Platform Environment Configuration

# Database Configuration (Development)
ENVIRONMENT=development
DB_USER=sahayak_dev
DB_PASSWORD=sahayak_password
DB_NAME=sahayak_dev_db
DB_HOST=localhost
DB_PORT=5432
DB_SSL=false

# Database Configuration (Production - Google Cloud SQL)
# ENVIRONMENT=production
# DB_USER=sahayak_user
# DB_PASSWORD=your-secure-password
# DB_NAME=sahayak_production
# DB_HOST=your-cloud-sql-ip
# DB_PORT=5432
# DB_SSL=true
# GOOGLE_CLOUD_SQL_INSTANCE=project:region:instance

# Authentication Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=30
PASSWORD_RESET_EXPIRE_HOURS=2

# Google AI Configuration
GOOGLE_API_KEY=your-google-ai-api-key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true

# File Upload Configuration
MAX_FILE_SIZE_MB=50
UPLOAD_FOLDER=uploads

# Session Configuration
SESSION_TIMEOUT_HOURS=24
"""
    
    with open('.env.template', 'w') as f:
        f.write(env_template)
    
    print("✅ Created .env.template file")
    print("📝 Please copy .env.template to .env and update with your actual values")

def create_database_init_script():
    """Create database initialization script"""
    init_script = """#!/usr/bin/env python3
\"\"\"
Database initialization script for Sahayak platform
Run this script to set up the database tables and sample data
\"\"\"

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.config import initialize_database
from database.models import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    \"\"\"Initialize the database\"\"\"
    print("🚀 Initializing Sahayak Database...")
    print("=" * 50)
    
    try:
        # Initialize database
        success = initialize_database()
        
        if success:
            print("✅ Database initialization completed successfully!")
            print("\\n📊 Database is ready for use")
            print("\\n🔧 Next steps:")
            print("1. Update your .env file with correct database credentials")
            print("2. Run 'python app.py' to start the Flask application")
            print("3. Test the authentication endpoints")
            
        else:
            print("❌ Database initialization failed!")
            print("\\n🔧 Troubleshooting:")
            print("1. Check your database connection settings in .env")
            print("2. Ensure PostgreSQL is running")
            print("3. Verify database user permissions")
            
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
"""
    
    with open('init_database.py', 'w') as f:
        f.write(init_script)
    
    os.chmod('init_database.py', 0o755)  # Make executable
    print("✅ Created init_database.py script")

def create_app_integration_guide():
    """Create integration guide for updating app.py"""
    guide = """# App.py Integration Guide

## 🔧 Steps to Integrate Database with Existing app.py

### 1. Add Database Imports
Add these imports to the top of your app.py:

```python
from dotenv import load_dotenv
from database.config import get_database_session_context
from database.content_manager import content_manager
from auth.routes import auth_bp
from auth.auth_manager import auth_manager
```

### 2. Load Environment Variables
Add after imports:

```python
# Load environment variables
load_dotenv()
```

### 3. Register Authentication Blueprint
Add after creating the Flask app:

```python
# Register authentication routes
app.register_blueprint(auth_bp)
```

### 4. Add Authentication Middleware
Create a decorator for protected routes:

```python
from functools import wraps
from flask import request, jsonify

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header'}), 401
        
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
        
        current_user = auth_manager.get_current_user(token)
        if not current_user:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.current_user = current_user
        return f(*args, **kwargs)
    
    return decorated_function
```

### 5. Update Existing Routes
For each content generation route, add:

1. Authentication requirement: `@require_auth`
2. Database saving: Use `content_manager.save_*()` methods
3. User context: Access `request.current_user.id`

Example for ELI5 route:
```python
@app.route('/api/eli5/generate', methods=['POST'])
@require_auth
def generate_eli5():
    try:
        data = request.get_json()
        user_id = str(request.current_user.id)
        
        # Generate content (existing logic)
        explanation = generate_explanation(data)
        
        # Save to database
        success, message, saved_data = content_manager.save_eli5_explanation(
            user_id=user_id,
            explanation_data={
                'topic': data.get('topic'),
                'explanation': explanation,
                'grade_level': data.get('gradeLevel'),
                'subject': data.get('subject'),
                'complexity_level': data.get('complexity', 'simple'),
                'language': data.get('language', 'en')
            }
        )
        
        if success:
            return jsonify({
                'success': True,
                'explanation': explanation,
                'saved_data': saved_data
            })
        else:
            return jsonify({
                'success': True,
                'explanation': explanation,
                'warning': f'Content generated but not saved: {message}'
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 6. Add Content Retrieval Routes
Add routes to get user's saved content:

```python
@app.route('/api/content/<content_type>', methods=['GET'])
@require_auth
def get_user_content(content_type):
    try:
        user_id = str(request.current_user.id)
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        content_methods = {
            'eli5': content_manager.get_eli5_explanations,
            'stories': content_manager.get_stories,
            'visual-aids': content_manager.get_visual_aids,
            'games': content_manager.get_educational_games,
            'lesson-plans': content_manager.get_lesson_plans,
            'fluency-assessments': content_manager.get_fluency_assessments
        }
        
        if content_type not in content_methods:
            return jsonify({'error': 'Invalid content type'}), 400
        
        content = content_methods[content_type](user_id, limit, offset)
        
        return jsonify({
            'success': True,
            'content': content,
            'count': len(content)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 7. Update Fluency Assessment
Modify the fluency assessment route to save results:

```python
@app.route('/api/evaluate', methods=['POST'])
@require_auth
def evaluate_fluency():
    try:
        # Existing evaluation logic...
        
        # Save assessment to database
        user_id = str(request.current_user.id)
        assessment_data = {
            'student_name': request.form.get('student_name'),
            'grade_level': request.form.get('grade_level'),
            'assessment_text': request.form.get('reference_text'),
            'text_title': request.form.get('text_title', 'Reading Assessment'),
            'audio_file_url': audio_path,  # Path to saved audio file
            'audio_duration_seconds': float(request.form.get('audio_duration', 0)),
            'is_custom_text': request.form.get('assessment_type') == 'custom'
        }
        
        success, message, assessment = content_manager.save_fluency_assessment(
            user_id=user_id,
            assessment_data=assessment_data
        )
        
        if success:
            # Queue the evaluation task with assessment ID
            task_id = queue_evaluation_task(assessment['id'], audio_path, reference_text)
            return jsonify({
                'task_id': task_id,
                'message': 'Assessment saved and queued for evaluation',
                'assessment_id': assessment['id']
            }), 202
        
        # Continue with existing logic if save fails...
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 8. Test the Integration
1. Run `python init_database.py` to set up the database
2. Start the Flask app: `python app.py`
3. Test authentication endpoints
4. Test content generation with authentication
5. Verify data is being saved to database

### 9. Frontend Updates
Update frontend to include authentication headers:

```javascript
// In your API calls, include the auth header
const token = localStorage.getItem('access_token')
const response = await fetch('/api/eli5/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```
"""
    
    with open('APP_INTEGRATION_GUIDE.md', 'w') as f:
        f.write(guide)
    
    print("✅ Created APP_INTEGRATION_GUIDE.md")

def main():
    """Run the migration process"""
    print("🚀 Sahayak Database Migration Tool")
    print("=" * 50)
    
    # Check if we're in the Backend directory
    if not os.path.exists('app.py'):
        print("❌ Error: app.py not found. Please run this script from the Backend directory.")
        sys.exit(1)
    
    print("📋 Starting migration process...")
    
    # Step 1: Backup existing files
    backup_dir = backup_existing_files()
    print(f"📦 Backup created in: {backup_dir}")
    
    # Step 2: Update requirements
    update_requirements()
    
    # Step 3: Create environment template
    create_env_template()
    
    # Step 4: Create database initialization script
    create_database_init_script()
    
    # Step 5: Create integration guide
    create_app_integration_guide()
    
    print("\n✅ Migration preparation completed!")
    print("\n🔧 Next Steps:")
    print("1. Install new dependencies: pip install -r requirements.txt")
    print("2. Set up PostgreSQL database (local or Google Cloud SQL)")
    print("3. Copy .env.template to .env and configure your settings")
    print("4. Run: python init_database.py")
    print("5. Follow the APP_INTEGRATION_GUIDE.md to update your app.py")
    print("6. Test the authentication and database integration")
    
    print(f"\n📦 Your original files are backed up in: {backup_dir}")
    print("🎉 Ready to integrate PostgreSQL database with Sahayak!")

if __name__ == "__main__":
    main()
