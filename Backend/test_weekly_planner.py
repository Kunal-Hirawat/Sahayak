#!/usr/bin/env python3
"""
Test script for Weekly Lesson Planner Integration
This script tests the weekly lesson planner API with different scenarios
"""

import requests
import json
import os

def test_weekly_planner_api():
    """Test the Weekly Lesson Planner API with different scenarios"""
    
    # API endpoint
    url = "http://localhost:5000/api/generate_weekly_plan"
    
    print("📚 Testing Weekly Lesson Planner Integration")
    print("=" * 60)
    
    # Test scenarios
    test_scenarios = [
        {
            'name': 'Math - Fractions (Grade 3)',
            'data': {
                'subject': 'Math',
                'gradeLevel': '3',
                'topic': 'Fractions',
                'weekStartDate': '2024-01-15',
                'duration': '5',
                'periodsPerDay': '1',
                'periodDuration': '45',
                'learningObjectives': 'Students will understand basic fractions and be able to identify parts of a whole',
                'includeAssessment': 'true',
                'includeHomework': 'true',
                'teachingMethod': 'mixed'
            }
        },
        {
            'name': 'Science - Photosynthesis (Grade 5)',
            'data': {
                'subject': 'Science',
                'gradeLevel': '5',
                'topic': 'Photosynthesis',
                'weekStartDate': '2024-01-22',
                'duration': '5',
                'periodsPerDay': '2',
                'periodDuration': '40',
                'learningObjectives': 'Students will understand how plants make their own food and the importance of sunlight',
                'includeAssessment': 'true',
                'includeHomework': 'false',
                'teachingMethod': 'hands-on'
            }
        },
        {
            'name': 'Hindi - Poetry (Grade 4)',
            'data': {
                'subject': 'Hindi',
                'gradeLevel': '4',
                'topic': 'Hindi Poetry and Rhymes',
                'weekStartDate': '2024-01-29',
                'duration': '3',
                'periodsPerDay': '1',
                'periodDuration': '60',
                'learningObjectives': 'Students will appreciate Hindi poetry and learn to recite with proper pronunciation',
                'includeAssessment': 'false',
                'includeHomework': 'true',
                'teachingMethod': 'interactive'
            }
        }
    ]
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n🧪 Test {i}: {scenario['name']}")
        print("-" * 50)
        
        try:
            # Send POST request
            response = requests.post(
                url,
                data=scenario['data'],  # Send as form data
                timeout=120  # Longer timeout for AI generation
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('status') == 'success':
                    plan_data = result.get('data', {})
                    
                    print(f"✅ Lesson plan generated successfully!")
                    print(f"📖 Subject: {plan_data.get('subject', 'N/A')}")
                    print(f"🎯 Grade: {plan_data.get('gradeLevel', 'N/A')}")
                    print(f"📝 Topic: {plan_data.get('topic', 'N/A')}")
                    print(f"📅 Duration: {plan_data.get('duration', 'N/A')}")
                    
                    # Show content preview
                    content = plan_data.get('generatedContent', '')
                    if content:
                        print(f"📋 Content Preview: {content[:200]}...")
                    
                    # Show summary if available
                    summary = plan_data.get('summary', {})
                    if summary:
                        print(f"🔧 Teaching Method: {summary.get('teachingMethod', 'N/A')}")
                        print(f"⏱️  Period Duration: {summary.get('periodDuration', 'N/A')}")
                        print(f"📊 Includes Assessment: {summary.get('includesAssessment', 'N/A')}")
                        print(f"📚 Includes Homework: {summary.get('includesHomework', 'N/A')}")
                    
                else:
                    print(f"❌ API Error: {result.get('message', 'Unknown error')}")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error Message: {error_data.get('message', 'No message')}")
                except:
                    print(f"Response Text: {response.text[:200]}...")
                    
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Backend server not running")
            break
        except requests.exceptions.Timeout:
            print("❌ Timeout Error: Request took too long (>120s)")
        except Exception as e:
            print(f"❌ Unexpected Error: {str(e)}")
    
    print("\n🎉 Weekly Lesson Planner testing completed!")

def test_weekly_planner_with_pdf():
    """Test the Weekly Lesson Planner API with PDF upload"""
    
    print("\n📄 Testing Weekly Lesson Planner with PDF Upload")
    print("=" * 55)
    
    # Check if test PDF exists
    test_pdf_path = "test_syllabus.pdf"
    
    if not os.path.exists(test_pdf_path):
        print("⚠️  No test PDF found. Creating a simple test scenario without PDF...")
        test_weekly_planner_without_pdf()
        return
    
    url = "http://localhost:5000/api/generate_weekly_plan"
    
    # Test data
    form_data = {
        'subject': 'Math',
        'gradeLevel': '5',
        'topic': 'Geometry - Shapes and Angles',
        'weekStartDate': '2024-02-05',
        'duration': '5',
        'periodsPerDay': '1',
        'periodDuration': '45',
        'learningObjectives': 'Students will identify different shapes and understand basic angle concepts',
        'includeAssessment': 'true',
        'includeHomework': 'true',
        'teachingMethod': 'hands-on'
    }
    
    try:
        # Prepare files for upload
        with open(test_pdf_path, 'rb') as pdf_file:
            files = {'syllabusFile': pdf_file}
            
            print(f"📤 Uploading PDF: {test_pdf_path}")
            
            response = requests.post(
                url,
                data=form_data,
                files=files,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('status') == 'success':
                    plan_data = result.get('data', {})
                    
                    print(f"✅ Lesson plan with PDF generated successfully!")
                    print(f"📖 Subject: {plan_data.get('subject', 'N/A')}")
                    print(f"📝 Topic: {plan_data.get('topic', 'N/A')}")
                    
                    content = plan_data.get('generatedContent', '')
                    if content:
                        print(f"📋 Content Preview: {content[:300]}...")
                        
                        # Check if PDF content influenced the plan
                        if any(keyword in content.lower() for keyword in ['syllabus', 'curriculum', 'chapter']):
                            print("🎯 PDF content appears to have influenced the lesson plan!")
                        else:
                            print("ℹ️  Lesson plan generated with general content")
                    
                else:
                    print(f"❌ API Error: {result.get('message', 'Unknown error')}")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
                print(f"Error: {error_data.get('message', response.text[:200])}")
                
    except FileNotFoundError:
        print(f"❌ Test PDF not found: {test_pdf_path}")
    except Exception as e:
        print(f"❌ Error testing with PDF: {str(e)}")

def test_weekly_planner_without_pdf():
    """Test the Weekly Lesson Planner API without PDF (fallback test)"""
    
    print("\n📝 Testing Weekly Lesson Planner without PDF")
    print("-" * 45)
    
    url = "http://localhost:5000/api/generate_weekly_plan"
    
    form_data = {
        'subject': 'Social Studies',
        'gradeLevel': '6',
        'topic': 'Indian Freedom Struggle',
        'weekStartDate': '2024-02-12',
        'duration': '4',
        'periodsPerDay': '1',
        'periodDuration': '50',
        'learningObjectives': 'Students will understand key events and personalities of Indian independence movement',
        'includeAssessment': 'true',
        'includeHomework': 'true',
        'teachingMethod': 'interactive'
    }
    
    try:
        response = requests.post(
            url,
            data=form_data,
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('status') == 'success':
                plan_data = result.get('data', {})
                
                print(f"✅ Lesson plan generated without PDF!")
                print(f"📖 Subject: {plan_data.get('subject', 'N/A')}")
                print(f"📝 Topic: {plan_data.get('topic', 'N/A')}")
                
                content = plan_data.get('generatedContent', '')
                if content:
                    print(f"📋 Content Preview: {content[:250]}...")
                
            else:
                print(f"❌ API Error: {result.get('message', 'Unknown error')}")
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_api_validation():
    """Test API validation with invalid inputs"""
    
    print("\n🔍 Testing API Validation")
    print("-" * 30)
    
    url = "http://localhost:5000/api/generate_weekly_plan"
    
    # Test missing required fields
    invalid_scenarios = [
        {
            'name': 'Missing topic',
            'data': {
                'subject': 'Math',
                'gradeLevel': '3'
                # Missing topic
            }
        },
        {
            'name': 'Missing subject',
            'data': {
                'gradeLevel': '3',
                'topic': 'Fractions'
                # Missing subject
            }
        },
        {
            'name': 'Empty topic',
            'data': {
                'subject': 'Math',
                'gradeLevel': '3',
                'topic': ''  # Empty topic
            }
        }
    ]
    
    for scenario in invalid_scenarios:
        print(f"\n🧪 Testing: {scenario['name']}")
        
        try:
            response = requests.post(
                url,
                data=scenario['data'],
                timeout=30
            )
            
            if response.status_code == 400:
                result = response.json()
                print(f"✅ Validation working: {result.get('message', 'Validation error')}")
            else:
                print(f"⚠️  Unexpected response: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    # Check if backend is running
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running!")
            test_weekly_planner_api()
            test_weekly_planner_with_pdf()
            test_api_validation()
        else:
            print(f"⚠️ Backend server responded with status: {response.status_code}")
    except:
        print("❌ Backend server is not running!")
        print("\n📋 To start the backend server:")
        print("1. cd Backend")
        print("2. python app.py")
        print("3. Run this test again")
