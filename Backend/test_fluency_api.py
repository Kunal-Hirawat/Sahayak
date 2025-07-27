#!/usr/bin/env python3
"""
Test script for Audio Fluency Assessment API
Tests the /evaluate endpoint with sample data
"""

import os
import requests
import json
from io import BytesIO

def test_evaluate_endpoint():
    """Test the /evaluate endpoint with enhanced data"""
    print("🎤 Testing Enhanced Audio Fluency Assessment API...")

    # Test data with all new fields
    test_data = {
        'reference_text': 'The cat sat on the mat. The cat has a red hat. The hat is big. The cat likes the hat.',
        'student_name': 'Test Student',
        'grade_level': '1',
        'assessment_type': 'fluency',
        'text_title': 'The Cat and the Hat',
        'audio_duration': '15.5',
        'teacher_name': 'Test Teacher',
        'timestamp': '2024-01-15T10:30:00Z'
    }

    # Create a more realistic dummy audio file
    dummy_audio = b"RIFF" + b"\x00" * 36 + b"WAVE" + b"fmt " + b"\x00" * 100  # Minimal WAV header
    audio_file = BytesIO(dummy_audio)
    audio_file.name = 'fluency_Test_Student_1705312200.mp3'
    
    try:
        print("🎤 Sending request to /api/evaluate...")
        
        # Prepare files and data
        files = {
            'audio': ('test_audio.mp3', audio_file, 'audio/mp3')
        }
        
        data = test_data
        
        # Make request
        response = requests.post(
            'http://localhost:5000/api/evaluate',
            files=files,
            data=data,
            timeout=60
        )
        
        print(f"🎤 Response status: {response.status_code}")
        print(f"🎤 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API endpoint is working!")
            print(f"🎤 Response: {json.dumps(result, indent=2)}")
            
            # Check expected fields with enhanced validation
            if 'success' in result or 'status' in result:
                success = result.get('success', result.get('status') == 'success')
                if success:
                    print("✅ Success response received")

                    # Check for analysis data
                    data = result.get('data', result.get('analysis', result))
                    if data:
                        print(f"✅ Analysis data keys: {list(data.keys())}")

                        # Validate expected fluency metrics
                        expected_fields = ['reading_speed', 'accuracy', 'fluency_score', 'feedback', 'recommendations']
                        found_fields = []

                        for field in expected_fields:
                            if field in data or any(alt in data for alt in [f"{field}s", f"{field}_percentage", f"overall_{field}"]):
                                found_fields.append(field)

                        print(f"✅ Found fluency metrics: {found_fields}")

                        if len(found_fields) >= 3:
                            print("✅ Sufficient fluency data returned")
                        else:
                            print("⚠️ Limited fluency data - may need backend adjustments")
                    else:
                        print("⚠️ No analysis data found in response")
                else:
                    error_msg = result.get('error', result.get('message', 'Unknown error'))
                    print(f"❌ API returned error: {error_msg}")
            else:
                print("⚠️ Unexpected response format")
                print(f"Available keys: {list(result.keys())}")
                
        else:
            print(f"❌ HTTP Error {response.status_code}")
            print(f"❌ Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is the Flask server running on localhost:5000?")
    except requests.exceptions.Timeout:
        print("❌ Request timed out. Audio processing might take longer...")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def check_backend_status():
    """Check if backend is running"""
    print("🔍 Checking backend status...")
    
    try:
        response = requests.get('http://localhost:5000/', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"⚠️ Backend responded with status {response.status_code}")
            return False
    except:
        print("❌ Backend is not running or not accessible")
        return False

def test_multiple_grade_levels():
    """Test different grade levels"""
    print("\n🎓 Testing Multiple Grade Levels...")

    grade_texts = {
        '1': 'The cat sat on the mat. The cat has a red hat.',
        '2': 'I have a pet dog named Max. Max is brown and white. He likes to play fetch.',
        '3': 'Our school has a beautiful garden. Students plant flowers and vegetables every day.',
        '4': 'The ocean is home to many wonderful creatures. Dolphins swim gracefully through the waves.',
        '5': 'Space exploration has always fascinated humans. Astronauts conduct important scientific experiments.'
    }

    for grade, text in grade_texts.items():
        print(f"\n📚 Testing Grade {grade}...")

        test_data = {
            'reference_text': text,
            'student_name': f'Grade{grade}_Student',
            'grade_level': grade,
            'assessment_type': 'fluency',
            'text_title': f'Grade {grade} Reading Text',
            'teacher_name': 'Test Teacher'
        }

        # Create dummy audio
        dummy_audio = b"dummy audio for grade " + grade.encode()
        audio_file = BytesIO(dummy_audio)
        audio_file.name = f'grade_{grade}_test.mp3'

        try:
            files = {'audio': (f'grade_{grade}_test.mp3', audio_file, 'audio/mp3')}
            response = requests.post('http://localhost:5000/api/evaluate', files=files, data=test_data, timeout=30)

            if response.status_code == 200:
                result = response.json()
                success = result.get('success', result.get('status') == 'success')
                print(f"✅ Grade {grade}: {'Success' if success else 'Failed'}")
            else:
                print(f"❌ Grade {grade}: HTTP {response.status_code}")

        except Exception as e:
            print(f"❌ Grade {grade}: {str(e)}")

def main():
    """Main test function"""
    print("🎤 Enhanced Audio Fluency Assessment API Test")
    print("=" * 60)

    # Check backend status first
    if not check_backend_status():
        print("\n💡 To start the backend:")
        print("   cd Backend")
        print("   python app.py")
        return

    print("\n🧪 Testing basic /evaluate endpoint:")
    test_evaluate_endpoint()

    print("\n🎓 Testing multiple grade levels:")
    test_multiple_grade_levels()

    print("\n🎯 Enhanced Test Summary:")
    print("- ✅ marks indicate successful API responses")
    print("- ❌ marks indicate issues that need attention")
    print("- The frontend now supports:")
    print("  • Enhanced text editor with analysis")
    print("  • Audio format conversion (WebM → MP3)")
    print("  • Detailed fluency metrics display")
    print("  • PDF and CSV export functionality")
    print("  • Grade-specific recommendations")
    print("\n📱 Frontend Testing:")
    print("- Navigate to /create/fluency-assessment")
    print("- Try both grade-level and custom texts")
    print("- Test audio recording and analysis")
    print("- Check export functionality")

if __name__ == "__main__":
    main()
