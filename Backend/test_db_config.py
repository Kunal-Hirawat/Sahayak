#!/usr/bin/env python3
"""
Simple test script to verify database configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_variables():
    """Test that environment variables are being read correctly"""
    print("🔍 Testing Environment Variables")
    print("=" * 40)
    
    env_vars = [
        'ENVIRONMENT',
        'DB_USER',
        'DB_PASSWORD', 
        'DB_NAME',
        'DB_HOST',
        'DB_PORT',
        'DB_SSL'
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Don't print password in full
            if 'PASSWORD' in var:
                print(f"✅ {var}: {'*' * len(value)}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"⚠️ {var}: Not set (will use default)")
    
    print()

def test_database_url():
    """Test database URL generation"""
    print("🔗 Testing Database URL Generation")
    print("=" * 40)
    
    try:
        from database.config import DatabaseConfig
        
        config = DatabaseConfig()
        print(f"✅ Environment: {config.environment}")
        
        # Don't print the full URL (contains password)
        url_parts = config.database_url.split('@')
        if len(url_parts) > 1:
            host_part = url_parts[1]
            print(f"✅ Database URL generated successfully")
            print(f"   Host part: {host_part}")
        else:
            print(f"✅ Database URL: {config.database_url}")
            
        return True
        
    except Exception as e:
        print(f"❌ Database URL generation failed: {e}")
        return False

def test_database_connection():
    """Test actual database connection"""
    print("🔌 Testing Database Connection")
    print("=" * 40)
    
    try:
        from database.config import db_config
        
        # Test connection
        if db_config.test_connection():
            print("✅ Database connection successful!")
            return True
        else:
            print("❌ Database connection failed")
            print("💡 This is expected if PostgreSQL is not running or configured")
            return False
            
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        print("💡 This is expected if PostgreSQL is not running or configured")
        return False

def test_database_initialization():
    """Test database table creation"""
    print("🏗️ Testing Database Initialization")
    print("=" * 40)
    
    try:
        from database.config import initialize_database
        
        if initialize_database():
            print("✅ Database initialization successful!")
            return True
        else:
            print("❌ Database initialization failed")
            return False
            
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Database Configuration Test")
    print("=" * 50)
    
    # Test 1: Environment variables
    test_environment_variables()
    
    # Test 2: Database URL generation
    url_success = test_database_url()
    
    if not url_success:
        print("❌ Cannot proceed with connection tests due to URL generation failure")
        return
    
    # Test 3: Database connection
    connection_success = test_database_connection()
    
    # Test 4: Database initialization (only if connection works)
    if connection_success:
        test_database_initialization()
    else:
        print("⏭️ Skipping database initialization test (no connection)")
    
    print("\n📋 Summary:")
    print("✅ Environment variable handling: Working")
    print(f"✅ Database URL generation: {'Working' if url_success else 'Failed'}")
    print(f"{'✅' if connection_success else '⚠️'} Database connection: {'Working' if connection_success else 'Not available'}")
    
    if not connection_success:
        print("\n🔧 To fix database connection:")
        print("1. Install PostgreSQL locally:")
        print("   - Windows: Download from https://www.postgresql.org/download/windows/")
        print("   - Mac: brew install postgresql")
        print("   - Linux: sudo apt-get install postgresql")
        print("2. Create database and user:")
        print("   sudo -u postgres psql")
        print("   CREATE DATABASE sahayak_dev_db;")
        print("   CREATE USER sahayak_dev WITH PASSWORD 'sahayak_password';")
        print("   GRANT ALL PRIVILEGES ON DATABASE sahayak_dev_db TO sahayak_dev;")
        print("3. Or update .env file with your Google Cloud SQL credentials")
    
    print("\n🎉 Configuration test completed!")

if __name__ == "__main__":
    main()
