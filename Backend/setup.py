#!/usr/bin/env python3
"""
Sahayak Backend Setup Script
This script helps set up the backend environment and test the API
"""

import os
import subprocess
import sys

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install packages: {e}")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    print("🔍 Checking environment configuration...")
    
    if not os.path.exists('.env'):
        print("⚠️  .env file not found!")
        print("📝 Please create a .env file with your GEMINI_API_KEY")
        print("💡 You can copy .env.example and fill in your values")
        return False
    
    # Check if GEMINI_API_KEY is set
    from dotenv import load_dotenv
    load_dotenv()
    
    if not os.getenv('GEMINI_API_KEY'):
        print("⚠️  GEMINI_API_KEY not found in .env file!")
        print("🔑 Please add your Gemini API key to the .env file")
        return False
    
    print("✅ Environment configuration looks good!")
    return True

def test_ai_function():
    """Test the AI function"""
    print("🧠 Testing AI function...")
    try:
        from AI.eli5_enhanced import explain_to_kid
        
        result = explain_to_kid(
            topic="Photosynthesis",
            grade_level="4",
            subject="Science", 
            local_context="Mumbai, Maharashtra",
            complexity="simple",
            include_analogy=True,
            include_example=True
        )
        
        if result and 'explanation' in result:
            print("✅ AI function working correctly!")
            print(f"📝 Sample explanation: {result['explanation'][:100]}...")
            return True
        else:
            print("❌ AI function returned invalid result")
            return False
            
    except Exception as e:
        print(f"❌ AI function test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Sahayak Backend Setup")
    print("=" * 40)
    
    # Step 1: Install requirements
    if not install_requirements():
        print("❌ Setup failed at package installation")
        return
    
    # Step 2: Check environment
    if not check_env_file():
        print("❌ Setup failed at environment check")
        print("\n📋 Next steps:")
        print("1. Copy .env.example to .env")
        print("2. Add your GEMINI_API_KEY to .env")
        print("3. Run this setup script again")
        return
    
    # Step 3: Test AI function
    if not test_ai_function():
        print("❌ Setup failed at AI function test")
        return
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Run: python app.py")
    print("2. Test API at: http://localhost:5000")
    print("3. Test ELI5 endpoint: http://localhost:5000/api/eli5/generate")

if __name__ == "__main__":
    main()
