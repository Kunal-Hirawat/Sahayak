#!/usr/bin/env python3
"""
Test the complete fluency assessment flow:
1. Submit audio for analysis
2. Poll for results
3. Display final results
"""

import requests
import time
import json
from io import BytesIO

def test_complete_flow():
    print("🎤 Testing Complete Fluency Assessment Flow...")
    print("=" * 50)
    
    # Step 1: Submit audio for analysis
    print("\n📤 Step 1: Submitting audio for analysis...")
    
    # Create dummy audio file
    dummy_audio = b"dummy audio content for fluency test"
    audio_file = BytesIO(dummy_audio)
    
    # Test data
    data = {
        'reference_text': 'The cat sat on the mat. The cat has a red hat. The hat is big. The cat likes the hat.',
        'student_name': 'Test Student',
        'grade_level': '2',
        'assessment_type': 'fluency',
        'text_title': 'The Cat and the Hat',
        'audio_duration': '15.5',
        'teacher_name': 'Test Teacher'
    }
    
    files = {
        'audio': ('fluency_test_student.mp3', audio_file, 'audio/mp3')
    }
    
    try:
        # Submit the task
        response = requests.post(
            'http://localhost:5000/api/evaluate',
            files=files,
            data=data,
            timeout=10
        )
        
        print(f"📤 Submit Status: {response.status_code}")
        
        if response.status_code != 202:
            print(f"❌ Expected 202, got {response.status_code}")
            print(f"Response: {response.text}")
            return
        
        result = response.json()
        task_id = result.get('task_id')
        
        if not task_id:
            print("❌ No task_id in response")
            print(f"Response: {result}")
            return
        
        print(f"✅ Task submitted successfully! Task ID: {task_id}")
        
        # Step 2: Poll for results
        print(f"\n🔄 Step 2: Polling for results (Task ID: {task_id})...")
        
        max_attempts = 20  # 20 attempts = ~3 minutes
        attempt = 0
        
        while attempt < max_attempts:
            attempt += 1
            print(f"🔄 Polling attempt {attempt}/{max_attempts}...")
            
            try:
                result_response = requests.get(
                    f'http://localhost:5000/api/results/{task_id}',
                    timeout=10
                )
                
                print(f"📥 Poll Status: {result_response.status_code}")
                
                if result_response.status_code == 200:
                    # Task completed!
                    print("✅ Task completed successfully!")
                    
                    result_data = result_response.json()
                    print("\n📊 Step 3: Analysis Results:")
                    print("=" * 30)
                    print(json.dumps(result_data, indent=2))
                    
                    # Check for expected fields
                    expected_fields = ['reading_speed', 'accuracy', 'fluency_score', 'feedback']
                    found_fields = []
                    
                    for field in expected_fields:
                        if field in result_data:
                            found_fields.append(field)
                    
                    print(f"\n✅ Found expected fields: {found_fields}")
                    
                    if len(found_fields) >= 2:
                        print("✅ Analysis appears to be working correctly!")
                    else:
                        print("⚠️ Limited analysis data returned")
                    
                    return
                    
                elif result_response.status_code == 202:
                    # Still processing
                    poll_data = result_response.json()
                    message = poll_data.get('message', 'Processing...')
                    print(f"⏳ {message}")
                    
                    if attempt < max_attempts:
                        print("⏳ Waiting 10 seconds before next poll...")
                        time.sleep(10)
                    
                else:
                    print(f"❌ Unexpected poll status: {result_response.status_code}")
                    print(f"Response: {result_response.text}")
                    return
                    
            except Exception as poll_error:
                print(f"❌ Polling error: {poll_error}")
                if attempt < max_attempts:
                    print("⏳ Retrying in 10 seconds...")
                    time.sleep(10)
                else:
                    return
        
        print("❌ Polling timed out - analysis may still be running")
        print(f"💡 You can manually check: http://localhost:5000/api/results/{task_id}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

def check_backend():
    """Quick backend health check"""
    try:
        response = requests.get('http://localhost:5000/', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"⚠️ Backend responded with {response.status_code}")
            return False
    except:
        print("❌ Backend is not accessible")
        return False

def main():
    print("🎤 Complete Fluency Assessment Flow Test")
    print("=" * 60)
    
    if not check_backend():
        print("\n💡 Make sure your Flask backend is running:")
        print("   cd Backend")
        print("   python app.py")
        return
    
    test_complete_flow()
    
    print("\n🎯 Test Summary:")
    print("- This test simulates the complete frontend → backend flow")
    print("- If successful, your fluency assessment should work end-to-end")
    print("- Any errors indicate areas that need attention")

if __name__ == "__main__":
    main()
