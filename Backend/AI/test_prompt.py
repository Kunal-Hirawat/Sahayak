#!/usr/bin/env python3
"""
Test script to see the generated prompts without calling the actual AI API.
This helps verify that our prompt generation logic is working correctly.
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from image import ImageGenerator

def test_prompt_generation():
    """Test the prompt generation with different parameter combinations."""
    print("🧪 Testing Enhanced Prompt Generation")
    print("=" * 60)
    
    # Create a mock generator to access the prompt building method
    generator = ImageGenerator.__new__(ImageGenerator)  # Create without calling __init__
    
    test_cases = [
        {
            "name": "Science Diagram - Colorful & Detailed",
            "params": {
                "topic": "Plant Cell Structure",
                "subject": "Science",
                "grade": "5",
                "diagram_type": "Diagram",
                "language": "English",
                "complexity": "detailed",
                "color_scheme": "colorful",
                "include_labels": True,
                "include_explanation": True,
                "size": "large",
                "style": "detailed",
                "additional_instructions": "Focus on organelles and their functions"
            }
        },
        {
            "name": "Math Chart - Blackboard Style",
            "params": {
                "topic": "Multiplication Tables",
                "subject": "Math",
                "grade": "3",
                "diagram_type": "Chart",
                "language": "English",
                "complexity": "simple",
                "color_scheme": "blackboard",
                "include_labels": True,
                "include_explanation": False,
                "size": "medium",
                "style": "simple",
                "additional_instructions": ""
            }
        },
        {
            "name": "Geography Map - Monochrome",
            "params": {
                "topic": "Indian States and Capitals",
                "subject": "Geography",
                "grade": "7",
                "diagram_type": "Map",
                "language": "English",
                "complexity": "medium",
                "color_scheme": "monochrome",
                "include_labels": True,
                "include_explanation": True,
                "size": "large",
                "style": "simple",
                "additional_instructions": "Include major rivers and mountain ranges"
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['name']}")
        print("-" * 40)
        
        try:
            # Generate the prompt
            prompt = generator._build_comprehensive_prompt(**test_case['params'])
            
            print("✅ Generated Prompt:")
            print(prompt)
            print("\n" + "="*60)
            
        except Exception as e:
            print(f"❌ Error generating prompt: {e}")

def main():
    """Main function to run the prompt tests."""
    print("🚀 Enhanced Prompt Generation Test")
    print("This script shows the prompts that will be sent to the AI model")
    print("without actually calling the expensive API.\n")
    
    test_prompt_generation()
    
    print("\n✨ Prompt generation test completed!")
    print("Review the prompts above to ensure they include all the parameters")
    print("and provide comprehensive instructions for the AI model.")

if __name__ == "__main__":
    main()
