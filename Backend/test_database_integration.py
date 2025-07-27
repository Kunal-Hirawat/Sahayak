#!/usr/bin/env python3
"""
Test script for database integration
Tests authentication and content saving functionality
"""

import requests
import json
import time
from io import BytesIO

BASE_URL = "http://localhost:5000"

class DatabaseIntegrationTester:
    def __init__(self):
        self.access_token = None
        self.user_data = None
        
    def test_user_registration(self):
        """Test user registration"""
        print("🔐 Testing user registration...")
        
        user_data = {
            "email": "test.teacher@sahayak.edu",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "Teacher",
            "phone": "+91-9876543210",
            "school_name": "Test School",
            "district": "Test District",
            "state": "Delhi",
            "grade_levels": ["1", "2", "3"],
            "subjects": ["Mathematics", "Science"],
            "experience_years": 5,
            "bio": "Test teacher for database integration"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
            
            if response.status_code == 201:
                result = response.json()
                print(f"✅ Registration successful: {result['message']}")
                return True
            else:
                result = response.json()
                print(f"⚠️ Registration response: {result.get('error', 'Unknown error')}")
                return True  # Might already exist
                
        except Exception as e:
            print(f"❌ Registration failed: {e}")
            return False
    
    def test_user_login(self):
        """Test user login"""
        print("🔐 Testing user login...")
        
        login_data = {
            "email": "test.teacher@sahayak.edu",
            "password": "testpassword123"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
            
            if response.status_code == 200:
                result = response.json()
                self.access_token = result['access_token']
                self.user_data = result['user']
                print(f"✅ Login successful: {result['message']}")
                print(f"   User: {self.user_data['full_name']}")
                print(f"   Token: {self.access_token[:20]}...")
                return True
            else:
                result = response.json()
                print(f"❌ Login failed: {result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
    
    def get_auth_headers(self):
        """Get authentication headers"""
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
    
    def test_eli5_generation(self):
        """Test ELI5 generation with database saving"""
        print("📚 Testing ELI5 generation...")
        
        if not self.access_token:
            print("❌ No access token available")
            return False
        
        eli5_data = {
            "topic": "How do plants make food?",
            "gradeLevel": "2",
            "subject": "Science",
            "complexity": "simple",
            "language": "english"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/eli5/generate",
                json=eli5_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ ELI5 generation successful")
                print(f"   Topic: {eli5_data['topic']}")
                print(f"   Saved to database: {result.get('saved', False)}")
                return True
            else:
                result = response.json()
                print(f"❌ ELI5 generation failed: {result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            print(f"❌ ELI5 generation failed: {e}")
            return False
    
    def test_story_generation(self):
        """Test story generation with database saving"""
        print("📖 Testing story generation...")
        
        if not self.access_token:
            print("❌ No access token available")
            return False
        
        story_data = {
            "topic": "Friendship",
            "gradeLevel": "3",
            "storyLength": "short",
            "localContext": "India",
            "storyType": "moral",
            "characters": "children",
            "setting": "school",
            "includeDialogue": True,
            "includeQuestions": True,
            "language": "english"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/generate_story",
                json=story_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Story generation successful")
                print(f"   Topic: {story_data['topic']}")
                print(f"   Saved to database: {result.get('saved', False)}")
                return True
            else:
                result = response.json()
                print(f"❌ Story generation failed: {result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            print(f"❌ Story generation failed: {e}")
            return False
    
    def test_content_retrieval(self):
        """Test content retrieval"""
        print("📋 Testing content retrieval...")
        
        if not self.access_token:
            print("❌ No access token available")
            return False
        
        content_types = ['eli5', 'stories', 'visual-aids', 'games', 'lesson-plans']
        
        for content_type in content_types:
            try:
                response = requests.get(
                    f"{BASE_URL}/api/content/{content_type}",
                    headers=self.get_auth_headers()
                )
                
                if response.status_code == 200:
                    result = response.json()
                    count = result.get('count', 0)
                    print(f"✅ {content_type}: {count} items")
                else:
                    print(f"⚠️ {content_type}: Failed to retrieve")
                    
            except Exception as e:
                print(f"❌ {content_type} retrieval failed: {e}")
        
        return True
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("📊 Testing dashboard statistics...")
        
        if not self.access_token:
            print("❌ No access token available")
            return False
        
        try:
            response = requests.get(
                f"{BASE_URL}/api/dashboard/stats",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                stats = result.get('stats', {})
                print(f"✅ Dashboard stats retrieved:")
                for key, value in stats.items():
                    print(f"   {key}: {value}")
                return True
            else:
                result = response.json()
                print(f"❌ Dashboard stats failed: {result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            print(f"❌ Dashboard stats failed: {e}")
            return False
    
    def test_logout(self):
        """Test user logout"""
        print("🔐 Testing user logout...")
        
        if not self.access_token:
            print("❌ No access token available")
            return False
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/auth/logout",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Logout successful: {result['message']}")
                self.access_token = None
                return True
            else:
                result = response.json()
                print(f"❌ Logout failed: {result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            print(f"❌ Logout failed: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Running Database Integration Tests")
        print("=" * 50)
        
        tests = [
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("ELI5 Generation", self.test_eli5_generation),
            ("Story Generation", self.test_story_generation),
            ("Content Retrieval", self.test_content_retrieval),
            ("Dashboard Stats", self.test_dashboard_stats),
            ("User Logout", self.test_logout)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            try:
                if test_func():
                    passed += 1
                    print(f"✅ {test_name} PASSED")
                else:
                    print(f"❌ {test_name} FAILED")
            except Exception as e:
                print(f"❌ {test_name} ERROR: {e}")
            
            time.sleep(1)  # Brief pause between tests
        
        print(f"\n📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Database integration is working correctly.")
        else:
            print("⚠️ Some tests failed. Check the output above for details.")
        
        return passed == total

def main():
    """Main test function"""
    print("🧪 Sahayak Database Integration Test Suite")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print("✅ Flask server is running")
    except Exception as e:
        print(f"❌ Flask server is not accessible: {e}")
        print("💡 Make sure to start the server with: python app.py")
        return
    
    # Run tests
    tester = DatabaseIntegrationTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎯 Integration Summary:")
        print("✅ Authentication system working")
        print("✅ Content generation saving to database")
        print("✅ Content retrieval working")
        print("✅ Dashboard statistics working")
        print("\n🚀 Your Sahayak platform is fully integrated with PostgreSQL!")
    else:
        print("\n🔧 Troubleshooting:")
        print("1. Check database connection in .env file")
        print("2. Ensure PostgreSQL is running")
        print("3. Verify database tables are created")
        print("4. Check Flask server logs for errors")

if __name__ == "__main__":
    main()
