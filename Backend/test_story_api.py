#!/usr/bin/env python3
"""
Test script for Story Generation API
This script tests the story generation endpoint with sample data
"""

import requests
import json

def test_story_api():
    """Test the story generation API endpoint"""
    
    # API endpoint
    url = "http://localhost:5000/api/generate_story"
    
    # Sample frontend data
    test_data = {
        "topic": "Friendship",
        "gradeLevel": "3",
        "storyLength": "medium",
        "storyType": "moral",
        "characters": "children",
        "setting": "school",
        "localContext": "Mumbai, Maharashtra",
        "moralLesson": "True friends help each other in difficult times",
        "includeDialogue": True,
        "includeQuestions": True,
        "language": "english"
    }
    
    print("🚀 Testing Story Generation API")
    print("=" * 50)
    print(f"📡 Endpoint: {url}")
    print(f"📝 Test Data: {json.dumps(test_data, indent=2)}")
    print("\n⏳ Sending request...")
    
    try:
        # Send POST request
        response = requests.post(
            url,
            headers={'Content-Type': 'application/json'},
            json=test_data,
            timeout=60  # 60 seconds timeout
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('status') == 'success':
                story_data = result.get('data', {})
                
                print("✅ Story Generated Successfully!")
                print("\n📖 Story Details:")
                print(f"Title: {story_data.get('title', 'N/A')}")
                print(f"Characters: {story_data.get('characters', [])}")
                print(f"Setting: {story_data.get('setting', 'N/A')}")
                print(f"Moral Lesson: {story_data.get('moralLesson', 'N/A')}")
                print(f"Reading Time: {story_data.get('readingTime', 'N/A')}")
                print(f"Word Count: {story_data.get('wordCount', 'N/A')}")
                
                print(f"\n📝 Story Content (first 200 chars):")
                content = story_data.get('content', '')
                print(f"{content[:200]}...")
                
                print(f"\n❓ Discussion Questions:")
                questions = story_data.get('discussionQuestions', [])
                for i, q in enumerate(questions[:3], 1):
                    print(f"{i}. {q}")
                
                print(f"\n📚 Vocabulary:")
                vocab = story_data.get('vocabulary', [])
                for item in vocab[:3]:
                    if isinstance(item, dict):
                        print(f"• {item.get('word', '')}: {item.get('meaning', '')}")
                
                print(f"\n🎯 Activities:")
                activities = story_data.get('activities', [])
                for i, activity in enumerate(activities[:3], 1):
                    print(f"{i}. {activity}")
                
                print("\n🎉 Test Completed Successfully!")
                
            else:
                print(f"❌ API Error: {result.get('message', 'Unknown error')}")
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Details: {error_data}")
            except:
                print(f"Response Text: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend server is running on localhost:5000")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long (>60 seconds)")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running!")
            return True
        else:
            print(f"⚠️ Backend server responded with status: {response.status_code}")
            return False
    except:
        print("❌ Backend server is not running!")
        return False

if __name__ == "__main__":
    print("🔍 Checking backend server status...")
    if test_health_check():
        print("\n" + "="*50)
        test_story_api()
    else:
        print("\n📋 To start the backend server:")
        print("1. cd Backend")
        print("2. python app.py")
        print("3. Run this test again")
