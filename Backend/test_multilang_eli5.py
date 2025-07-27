#!/usr/bin/env python3
"""
Test script for Multi-Language ELI5 (Explain Like I'm 5)
This script tests the ELI5 generation with different Indian languages
"""

import requests
import json

def test_multilang_eli5_api():
    """Test the ELI5 API with different languages"""
    
    # API endpoint
    url = "http://localhost:5000/api/eli5/generate"
    
    # Test languages
    test_languages = [
        {'code': 'english', 'name': 'English'},
        {'code': 'hindi', 'name': 'Hindi'},
        {'code': 'tamil', 'name': 'Tamil'},
        {'code': 'bengali', 'name': 'Bengali'},
        {'code': 'marathi', 'name': 'Marathi'}
    ]
    
    print("🧠 Testing Multi-Language ELI5 Generation")
    print("=" * 60)
    
    for lang in test_languages:
        print(f"\n🗣️  Testing {lang['name']} ({lang['code']})...")
        print("-" * 40)
        
        # Sample data for each language
        test_data = {
            "topic": "Photosynthesis",
            "gradeLevel": "3",
            "subject": "Science",
            "localContext": "Mumbai, Maharashtra",
            "complexity": "simple",
            "includeAnalogy": True,
            "includeExample": True,
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
                    eli5_data = result.get('data', {})
                    
                    print(f"✅ ELI5 explanation generated successfully in {lang['name']}!")
                    print(f"🌐 Language: {eli5_data.get('language', 'N/A')}")
                    
                    # Check for language fallback
                    if eli5_data.get('languageFallback'):
                        print(f"⚠️  Language Fallback: {eli5_data.get('fallbackMessage', 'N/A')}")
                    else:
                        print(f"🎯 Generated in requested language: {lang['name']}")
                    
                    # Show explanation preview
                    explanation = eli5_data.get('explanation', '')
                    print(f"📝 Explanation Preview: {explanation[:150]}...")
                    
                    # Show metaphor if available
                    metaphor = eli5_data.get('metaphor', '')
                    if metaphor:
                        print(f"🔗 Metaphor Preview: {metaphor[:100]}...")
                    
                    # Show example if available
                    example = eli5_data.get('example', '')
                    if example:
                        print(f"💡 Example Preview: {example[:100]}...")
                    
                    # Show recap points
                    recap = eli5_data.get('recap', [])
                    if recap:
                        print(f"📋 First Recap Point: {recap[0][:100]}...")
                    
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
    
    print("\n🎉 Multi-language ELI5 testing completed!")

def test_eli5_complexity_levels():
    """Test ELI5 with different complexity levels in Hindi"""
    
    print("\n🎚️  Testing ELI5 Complexity Levels in Hindi...")
    print("=" * 50)
    
    complexity_levels = ['simple', 'moderate', 'detailed']
    
    for complexity in complexity_levels:
        print(f"\n📊 Testing {complexity.upper()} complexity...")
        
        test_data = {
            "topic": "Gravity",
            "gradeLevel": "4",
            "subject": "Science",
            "localContext": "Delhi, India",
            "complexity": complexity,
            "includeAnalogy": True,
            "includeExample": True,
            "language": "hindi"
        }
        
        try:
            response = requests.post(
                "http://localhost:5000/api/eli5/generate",
                headers={'Content-Type': 'application/json'},
                json=test_data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                eli5_data = result.get('data', {})
                
                explanation = eli5_data.get('explanation', '')
                print(f"✅ {complexity.title()} explanation: {explanation[:120]}...")
                
                if eli5_data.get('languageFallback'):
                    print(f"⚠️  Fallback to English detected")
                
            else:
                print(f"❌ Failed with status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")

def test_eli5_cultural_context():
    """Test ELI5 with different cultural contexts"""
    
    print("\n🏛️  Testing ELI5 Cultural Context...")
    print("=" * 40)
    
    cultural_tests = [
        {'language': 'tamil', 'context': 'Chennai, Tamil Nadu', 'topic': 'Water Cycle'},
        {'language': 'punjabi', 'context': 'Amritsar, Punjab', 'topic': 'Seasons'},
        {'language': 'gujarati', 'context': 'Ahmedabad, Gujarat', 'topic': 'Plants'}
    ]
    
    for test in cultural_tests:
        print(f"\n🌍 Testing {test['language'].title()} context in {test['context']}...")
        
        test_data = {
            "topic": test['topic'],
            "gradeLevel": "3",
            "subject": "Science",
            "localContext": test['context'],
            "complexity": "simple",
            "includeAnalogy": True,
            "includeExample": True,
            "language": test['language']
        }
        
        try:
            response = requests.post(
                "http://localhost:5000/api/eli5/generate",
                headers={'Content-Type': 'application/json'},
                json=test_data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                eli5_data = result.get('data', {})
                
                print(f"✅ Generated for {test['language']} context")
                
                # Check if cultural elements are present
                explanation = eli5_data.get('explanation', '').lower()
                example = eli5_data.get('example', '').lower()
                
                # Look for cultural indicators
                cultural_found = any(word in explanation + example for word in [
                    test['context'].lower(), 'festival', 'food', 'tradition'
                ])
                
                if cultural_found:
                    print(f"🎯 Cultural context detected in response")
                else:
                    print(f"ℹ️  General response generated")
                
            else:
                print(f"❌ Failed with status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    # Check if backend is running
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running!")
            test_multilang_eli5_api()
            test_eli5_complexity_levels()
            test_eli5_cultural_context()
        else:
            print(f"⚠️ Backend server responded with status: {response.status_code}")
    except:
        print("❌ Backend server is not running!")
        print("\n📋 To start the backend server:")
        print("1. cd Backend")
        print("2. python app.py")
        print("3. Run this test again")
