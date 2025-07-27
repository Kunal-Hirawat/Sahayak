#!/usr/bin/env python3
"""
Debug test script to test the worksheet generator integration
This script helps identify issues in the backend before testing with frontend
"""

import os
import sys
import json
import requests
import time

def test_backend_directly():
    """Test the backend API directly without frontend"""
    print("🔧 DEBUG: Testing backend API directly...")
    
    # Test data
    test_data = {
        "topic": "Addition and Subtraction",
        "subject": "Math",
        "gradeLevel": ["3"],
        "difficultyLevels": ["medium"],
        "questionTypes": ["multiple-choice"],
        "questionCount": "5",
        "timeLimit": "20",
        "extractedContent": ""
    }
    
    print(f"🔧 DEBUG: Sending request with data: {json.dumps(test_data, indent=2)}")
    
    try:
        # Make request to backend
        response = requests.post(
            'http://localhost:5000/api/worksheet/generate',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        print(f"🔧 DEBUG: Response status: {response.status_code}")
        print(f"🔧 DEBUG: Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ DEBUG: Backend API working correctly!")
            print(f"🔧 DEBUG: Response keys: {list(result.keys())}")
            
            if result.get('status') == 'success':
                worksheets = result.get('data', {})
                print(f"🔧 DEBUG: Generated worksheets for grades: {list(worksheets.keys())}")
                
                for grade, worksheet in worksheets.items():
                    print(f"🔧 DEBUG: Grade {grade}:")
                    print(f"  - PDF data length: {len(worksheet.get('pdf_data', ''))} characters")
                    print(f"  - Questions count: {len(worksheet.get('questions', []))}")
                    print(f"  - Metadata: {worksheet.get('metadata', {})}")
            else:
                print(f"❌ DEBUG: Backend returned error: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ DEBUG: HTTP Error {response.status_code}")
            print(f"❌ DEBUG: Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ DEBUG: Cannot connect to backend. Is the Flask server running on localhost:5000?")
    except requests.exceptions.Timeout:
        print("❌ DEBUG: Request timed out. Backend might be processing...")
    except Exception as e:
        print(f"❌ DEBUG: Unexpected error: {e}")

def test_ai_module_directly():
    """Test the AI module directly"""
    print("\n🔧 DEBUG: Testing AI module directly...")
    
    try:
        # Add the AI directory to path
        sys.path.append(os.path.join(os.path.dirname(__file__), 'AI'))
        
        from AI.worksheet import WorksheetGenerator
        
        print("✅ DEBUG: Successfully imported WorksheetGenerator")
        
        # Create generator
        generator = WorksheetGenerator()
        print("✅ DEBUG: WorksheetGenerator created successfully")
        
        # Test data
        form_data = {
            "topic": "Simple Addition",
            "subject": "Math",
            "gradeLevel": ["2"],
            "difficultyLevels": ["easy"],
            "questionTypes": ["multiple-choice"],
            "questionCount": "3",
            "timeLimit": "15",
            "extractedContent": ""
        }
        
        print(f"🔧 DEBUG: Testing with form data: {json.dumps(form_data, indent=2)}")
        
        # Generate worksheet
        result = generator.generate_worksheets(form_data)
        
        if result['success']:
            print("✅ DEBUG: AI module working correctly!")
            worksheets = result['worksheets']
            
            for grade, worksheet in worksheets.items():
                print(f"🔧 DEBUG: Grade {grade} worksheet generated successfully")
                print(f"  - Questions: {worksheet['questions'][:2]}...")  # Show first 2 questions
                print(f"  - PDF data length: {len(worksheet['pdf_data'])} characters")
        else:
            print(f"❌ DEBUG: AI module failed: {result.get('error', 'Unknown error')}")
            
    except ImportError as e:
        print(f"❌ DEBUG: Failed to import AI module: {e}")
    except Exception as e:
        print(f"❌ DEBUG: AI module error: {e}")

def check_environment():
    """Check if environment is set up correctly"""
    print("🔧 DEBUG: Checking environment setup...")
    
    # Check if .env file exists
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        print("✅ DEBUG: .env file found")
        
        # Check if GEMINI_API_KEY is set
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            print("✅ DEBUG: GEMINI_API_KEY is set")
        else:
            print("❌ DEBUG: GEMINI_API_KEY not found in .env")
    else:
        print("❌ DEBUG: .env file not found")
    
    # Check if required packages are installed
    required_packages = ['google-generativeai', 'reportlab', 'PyMuPDF', 'flask', 'flask-cors']
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ DEBUG: {package} is installed")
        except ImportError:
            print(f"❌ DEBUG: {package} is NOT installed")

def main():
    """Main debug function"""
    print("🚀 Worksheet Generator Debug Test")
    print("=" * 50)
    
    print("\n1. Environment Check:")
    check_environment()
    
    print("\n2. AI Module Test:")
    test_ai_module_directly()
    
    print("\n3. Backend API Test:")
    print("Make sure your Flask server is running (python Backend/app.py)")
    input("Press Enter when server is ready...")
    test_backend_directly()
    
    print("\n🎯 Debug Summary:")
    print("- Check the console output above for any ❌ errors")
    print("- All ✅ items should be working correctly")
    print("- If you see errors, fix them before testing with frontend")
    print("\n📱 Frontend Testing:")
    print("- Open browser console (F12) when testing frontend")
    print("- Look for 🔧 DEBUG messages in console")
    print("- Check Network tab for API requests")

if __name__ == "__main__":
    main()
