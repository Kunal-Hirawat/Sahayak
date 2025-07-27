#!/usr/bin/env python3
"""
Setup script for database integration
This script installs dependencies and sets up the environment
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def install_dependencies():
    """Install required Python packages"""
    dependencies = [
        "sqlalchemy>=2.0.0",
        "psycopg2-binary>=2.9.0",
        "pyjwt>=2.8.0",
        "bcrypt>=4.0.0",
        "python-dotenv>=1.0.0"
    ]
    
    print("📦 Installing database dependencies...")
    for dep in dependencies:
        if not run_command(f"pip install {dep}", f"Installing {dep}"):
            return False
    
    return True

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = Path(".env")
    
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
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

# Authentication Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=30

# Google AI Configuration
GOOGLE_API_KEY=your-google-ai-api-key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true
"""
    
    try:
        with open(".env", "w") as f:
            f.write(env_template)
        print("✅ Created .env file")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    
    try:
        # Import after installing dependencies
        from database.config import db_config
        
        if db_config.test_connection():
            print("✅ Database connection successful")
            return True
        else:
            print("❌ Database connection failed")
            print("💡 Make sure PostgreSQL is running and credentials are correct")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure all dependencies are installed")
        return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def initialize_database():
    """Initialize database tables"""
    print("🏗️ Initializing database tables...")
    
    try:
        from database.config import initialize_database
        
        if initialize_database():
            print("✅ Database tables created successfully")
            return True
        else:
            print("❌ Database initialization failed")
            return False
            
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Sahayak Database Integration Setup")
    print("=" * 50)
    
    # Check if we're in the Backend directory
    if not os.path.exists('app.py'):
        print("❌ Error: app.py not found. Please run this script from the Backend directory.")
        sys.exit(1)
    
    # Step 1: Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Step 2: Create .env file
    if not create_env_file():
        print("❌ Failed to create .env file")
        sys.exit(1)
    
    # Step 3: Test database connection
    print("\n🔍 Testing database connection...")
    print("Note: This will fail if PostgreSQL is not set up yet")
    test_database_connection()  # Don't exit on failure, just inform
    
    # Step 4: Try to initialize database
    print("\n🏗️ Attempting to initialize database...")
    print("Note: This will fail if database connection is not working")
    initialize_database()  # Don't exit on failure, just inform
    
    print("\n✅ Setup completed!")
    print("\n🔧 Next Steps:")
    print("1. Update your .env file with correct database credentials")
    print("2. Make sure PostgreSQL is running")
    print("3. Run: python -c \"from database.config import initialize_database; initialize_database()\"")
    print("4. Start your Flask app: python app.py")
    print("5. Test authentication endpoints")
    
    print("\n📚 Available API Endpoints:")
    print("Authentication:")
    print("  POST /api/auth/register - Register new user")
    print("  POST /api/auth/login - Login user")
    print("  POST /api/auth/logout - Logout user")
    print("  GET /api/auth/profile - Get user profile")
    print("\nContent Generation (requires authentication):")
    print("  POST /api/eli5/generate - Generate ELI5 explanation")
    print("  POST /api/generate_story - Generate story")
    print("  POST /api/generate_weekly_plan - Generate lesson plan")
    print("  POST /api/visual-aid/generate - Generate visual aid")
    print("  POST /api/game/generate - Generate educational game")
    print("  POST /api/evaluate - Fluency assessment")
    print("\nContent Retrieval:")
    print("  GET /api/content/<type> - Get user's saved content")
    print("  GET /api/dashboard/stats - Get dashboard statistics")
    
    print("\n🎉 Your Sahayak platform is now database-ready!")

if __name__ == "__main__":
    main()
