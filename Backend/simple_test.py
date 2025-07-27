#!/usr/bin/env python3
"""
Simple test for the /api/evaluate endpoint
"""

import requests
from io import BytesIO

def test_api():
    print("🎤 Testing /api/evaluate endpoint...")
    
    # Create dummy audio file
    dummy_audio = b"dummy audio content"
    audio_file = BytesIO(dummy_audio)
    
    # Test data
    data = {
        'reference_text': 'The cat sat on the mat.',
        'student_name': 'Test Student',
        'grade_level': '1'
    }
    
    files = {
        'audio': ('test.mp3', audio_file, 'audio/mp3')
    }
    
    try:
        response = requests.post(
            'http://localhost:5000/api/evaluate',
            files=files,
            data=data,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 202:
            print("✅ API is working! Task queued successfully.")
            result = response.json()
            if 'task_id' in result:
                print(f"Task ID: {result['task_id']}")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()
