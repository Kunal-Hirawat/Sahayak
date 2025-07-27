#!/usr/bin/env python3
"""
Test script for the WorksheetGenerator class in worksheet.py
This script allows you to test the worksheet generation functionality separately from the server.
"""

import os
import sys
import base64
from datetime import datetime

# Add the current directory to Python path so we can import worksheet.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from worksheet import WorksheetGenerator
    print("✅ Successfully imported WorksheetGenerator")
except ImportError as e:
    print(f"❌ Failed to import WorksheetGenerator: {e}")
    sys.exit(1)

def save_pdf_from_base64(base64_string: str, filename: str):
    """Save a base64 encoded PDF to a file."""
    try:
        # Decode base64 string
        pdf_data = base64.b64decode(base64_string)
        
        # Save the PDF
        with open(filename, 'wb') as f:
            f.write(pdf_data)
        print(f"✅ PDF saved as: {filename}")
        
    except Exception as e:
        print(f"❌ Error saving PDF: {e}")

def test_worksheet_generation():
    """Test the worksheet generation functionality with sample data."""
    print("\n🧪 Starting Worksheet Generation Test...")
    print("=" * 50)
    
    # Create WorksheetGenerator instance
    try:
        generator = WorksheetGenerator()
        print("✅ WorksheetGenerator instance created successfully")
    except Exception as e:
        print(f"❌ Failed to create WorksheetGenerator: {e}")
        return
    
    # Test cases
    test_cases = [
        {
            "name": "Math Fractions - Multi-Grade",
            "data": {
                "topic": "Fractions",
                "subject": "Math",
                "gradeLevel": ["3", "4"],
                "difficultyLevels": ["medium"],
                "questionTypes": ["multiple-choice"],
                "questionCount": "8",
                "timeLimit": "30",
                "extractedContent": ""
            }
        },
        {
            "name": "Science Plants - Single Grade",
            "data": {
                "topic": "Plant Life Cycle",
                "subject": "Science",
                "gradeLevel": ["5"],
                "difficultyLevels": ["easy"],
                "questionTypes": ["fill-blanks"],
                "questionCount": "10",
                "timeLimit": "25",
                "extractedContent": "Plants grow from seeds. They need water, sunlight, and nutrients from soil."
            }
        }
    ]
    
    # Test each case
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['name']}")
        print(f"   Topic: {test_case['data']['topic']}")
        print(f"   Subject: {test_case['data']['subject']}")
        print(f"   Grades: {', '.join(test_case['data']['gradeLevel'])}")
        
        try:
            # Generate worksheet
            print("   🔄 Generating worksheet...")
            result = generator.generate_worksheets(test_case['data'])
            
            if result['success']:
                print("   ✅ Worksheet generated successfully!")
                
                # Save PDFs for each grade
                for grade, worksheet_data in result['worksheets'].items():
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"test_worksheet_grade_{grade}_{timestamp}.pdf"
                    save_pdf_from_base64(worksheet_data['pdf_data'], filename)
                    
                    # Print sample questions
                    print(f"   📊 Grade {grade} - Sample Questions:")
                    for j, question in enumerate(worksheet_data['questions'][:3], 1):
                        print(f"      {j}. {question}")
                    
                    # Print metadata
                    metadata = worksheet_data['metadata']
                    print(f"   📋 Grade {grade} Metadata: {metadata}")
                
            else:
                print(f"   ❌ Worksheet generation failed: {result['error']}")
                
        except Exception as e:
            print(f"   ❌ Unexpected error: {e}")
        
        print("-" * 30)

def interactive_test():
    """Interactive test mode where user can input custom parameters."""
    print("\n🎯 Interactive Test Mode")
    print("=" * 50)
    
    try:
        generator = WorksheetGenerator()
        print("✅ WorksheetGenerator ready for interactive testing")
    except Exception as e:
        print(f"❌ Failed to initialize WorksheetGenerator: {e}")
        return
    
    while True:
        print("\nEnter worksheet parameters (or 'quit' to exit):")
        
        topic = input("Topic: ").strip()
        if topic.lower() == 'quit':
            break
            
        subject = input("Subject: ").strip()
        grades = input("Grade levels (comma-separated, e.g., 3,4,5): ").strip().split(',')
        grades = [g.strip() for g in grades if g.strip()]
        
        difficulty = input("Difficulty (easy/medium/hard): ").strip() or "medium"
        question_type = input("Question type (multiple-choice/fill-blanks/short-answer): ").strip() or "multiple-choice"
        question_count = input("Number of questions (default: 10): ").strip() or "10"
        time_limit = input("Time limit in minutes (default: 30): ").strip() or "30"
        
        form_data = {
            "topic": topic,
            "subject": subject,
            "gradeLevel": grades,
            "difficultyLevels": [difficulty],
            "questionTypes": [question_type],
            "questionCount": question_count,
            "timeLimit": time_limit,
            "extractedContent": ""
        }
        
        print("\n🔄 Generating worksheet...")
        
        try:
            result = generator.generate_worksheets(form_data)
            
            if result['success']:
                print("✅ Worksheet generated successfully!")
                
                for grade, worksheet_data in result['worksheets'].items():
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    safe_topic = "".join(c for c in topic if c.isalnum() or c in (' ', '-', '_')).rstrip()[:20]
                    filename = f"interactive_worksheet_{safe_topic}_grade_{grade}_{timestamp}.pdf"
                    save_pdf_from_base64(worksheet_data['pdf_data'], filename)
                
            else:
                print(f"❌ Worksheet generation failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Unexpected error: {e}")

def main():
    """Main function to run the tests."""
    print("🚀 Worksheet Generator Test Suite")
    print("=" * 50)
    
    while True:
        print("\nChoose test mode:")
        print("1. Run predefined test cases")
        print("2. Interactive test mode")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            test_worksheet_generation()
        elif choice == '2':
            interactive_test()
        elif choice == '3':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()
