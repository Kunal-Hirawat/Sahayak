#!/usr/bin/env python3
"""
Test script for Multi-Language Story Generation
This script tests the story generation with different Indian languages
"""

import requests
import json

def test_multilang_story_api():
    """Test the story generation API with different languages"""
    
    # API endpoint
    url = "http://localhost:5000/api/generate_story"
    
    # Test languages
    test_languages = [
        {'code': 'english', 'name': 'English'},
        {'code': 'hindi', 'name': 'Hindi'},
        {'code': 'tamil', 'name': 'Tamil'},
        {'code': 'bengali', 'name': 'Bengali'}
    ]
    
    print("🌍 Testing Multi-Language Story Generation")
    print("=" * 60)
    
    for lang in test_languages:
        print(f"\n🗣️  Testing {lang['name']} ({lang['code']})...")
        print("-" * 40)
        
        # Sample data for each language
        test_data = {
            "topic": "Friendship",
            "gradeLevel": "3",
            "storyLength": "medium",
            "storyType": "moral",
            "characters": "children",
            "setting": "school",
            "localContext": "Mumbai, Maharashtra",
            "moralLesson": "True friends help each other",
            "includeDialogue": True,
            "includeQuestions": True,
            "language": lang['code']  # Different language for each test
        }
        
        try:
            # Send POST request
            response = requests.post(
                url,
                headers={'Content-Type': 'application/json'},
                json=test_data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('status') == 'success':
                    story_data = result.get('data', {})
                    
                    print(f"✅ Story generated successfully in {lang['name']}!")
                    print(f"📖 Title: {story_data.get('title', 'N/A')[:100]}...")
                    print(f"🌐 Language: {story_data.get('language', 'N/A')}")
                    
                    # Check for language fallback
                    if story_data.get('languageFallback'):
                        print(f"⚠️  Language Fallback: {story_data.get('fallbackMessage', 'N/A')}")
                    else:
                        print(f"🎯 Generated in requested language: {lang['name']}")
                    
                    # Show first 150 characters of content
                    content = story_data.get('content', '')
                    print(f"📝 Content Preview: {content[:150]}...")
                    
                    # Show discussion questions
                    questions = story_data.get('discussionQuestions', [])
                    if questions:
                        print(f"❓ First Question: {questions[0][:100]}...")
                    
                else:
                    print(f"❌ API Error: {result.get('message', 'Unknown error')}")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Backend server not running")
            break
        except requests.exceptions.Timeout:
            print("❌ Timeout Error: Request took too long")
        except Exception as e:
            print(f"❌ Unexpected Error: {str(e)}")
    
    print("\n🎉 Multi-language testing completed!")

def test_language_detection():
    """Test the language detection and fallback functionality"""
    
    print("\n🔍 Testing Language Detection...")
    print("=" * 40)
    
    # Test with a language that might not be supported well
    test_data = {
        "topic": "Science",
        "gradeLevel": "4",
        "storyLength": "short",
        "storyType": "educational",
        "characters": "children",
        "setting": "village",
        "localContext": "Rural India",
        "moralLesson": "",
        "includeDialogue": False,
        "includeQuestions": True,
        "language": "odia"  # Less common language
    }
    
    try:
        response = requests.post(
            "http://localhost:5000/api/generate_story",
            headers={'Content-Type': 'application/json'},
            json=test_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            story_data = result.get('data', {})
            
            print(f"📊 Language Detection Results:")
            print(f"   Requested: Odia")
            print(f"   Detected: {story_data.get('language', 'N/A')}")
            print(f"   Fallback: {story_data.get('languageFallback', False)}")
            
            if story_data.get('languageFallback'):
                print(f"   Message: {story_data.get('fallbackMessage', 'N/A')}")
            
        else:
            print(f"❌ Test failed with status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Test error: {str(e)}")

if __name__ == "__main__":
    # Check if backend is running
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running!")
            test_multilang_story_api()
            test_language_detection()
        else:
            print(f"⚠️ Backend server responded with status: {response.status_code}")
    except:
        print("❌ Backend server is not running!")
        print("\n📋 To start the backend server:")
        print("1. cd Backend")
        print("2. python app.py")
        print("3. Run this test again")
