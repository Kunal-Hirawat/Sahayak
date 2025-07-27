#!/usr/bin/env python3
"""
Simple test script for the WorksheetGenerator class
Quick and easy way to test worksheet generation with minimal setup.
"""

import os
import sys
import base64

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from worksheet import WorksheetGenerator

def save_pdf_from_base64(base64_string, filename):
    """Save base64 PDF data to a file."""
    pdf_data = base64.b64decode(base64_string)
    with open(filename, 'wb') as f:
        f.write(pdf_data)
    print(f"PDF saved as: {filename}")

def main():
    print("Testing Worksheet Generator...")
    
    # Create generator instance
    generator = WorksheetGenerator()
    
    # Test with sample data
    form_data = {
        "topic": "Addition and Subtraction",
        "subject": "Math",
        "gradeLevel": ["3"],
        "difficultyLevels": ["medium"],
        "questionTypes": ["multiple-choice"],
        "questionCount": "5",
        "timeLimit": "20",
        "extractedContent": ""
    }
    
    result = generator.generate_worksheets(form_data)
    
    if result['success']:
        print("✅ Success! Worksheet generated.")
        
        for grade, worksheet_data in result['worksheets'].items():
            print(f"\nGrade {grade} Worksheet:")
            print(f"Questions: {len(worksheet_data['questions'])}")
            print(f"Metadata: {worksheet_data['metadata']}")
            
            # Save the PDF
            save_pdf_from_base64(worksheet_data['pdf_data'], f"test_worksheet_grade_{grade}.pdf")
            
            # Show sample questions
            print("Sample Questions:")
            for i, question in enumerate(worksheet_data['questions'][:3], 1):
                print(f"  {i}. {question}")
        
    else:
        print(f"❌ Failed: {result['error']}")

if __name__ == "__main__":
    main()
