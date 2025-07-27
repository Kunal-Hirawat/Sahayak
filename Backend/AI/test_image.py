#!/usr/bin/env python3
"""
Test script for the ImageGenerator class in image.py
This script allows you to test the image generation functionality separately from the server.
"""

import os
import sys
import base64
from datetime import datetime
from PIL import Image
import io

# Add the current directory to Python path so we can import image.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from image import ImageGenerator
    print("✅ Successfully imported ImageGenerator")
except ImportError as e:
    print(f"❌ Failed to import ImageGenerator: {e}")
    sys.exit(1)

def check_authentication():
    """Check if Google Cloud authentication is set up."""
    print("\n🔐 Checking Google Cloud Authentication...")

    try:
        # Try to create an ImageGenerator instance
        ImageGenerator()
        print("✅ Authentication successful!")
        return True
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        print("\n📋 To fix this, run one of the following commands:")
        print("1. For local development:")
        print("   gcloud auth application-default login")
        print("\n2. Or set up a service account:")
        print("   - Download service account key JSON file")
        print("   - Set environment variable:")
        print("   set GOOGLE_APPLICATION_CREDENTIALS=path\\to\\your\\service-account-key.json")
        print("\n3. Or authenticate with gcloud:")
        print("   gcloud auth login")
        return False

def save_base64_image(base64_string: str, filename: str):
    """Save a base64 encoded image to a file."""
    try:
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        
        # Create PIL Image from bytes
        image = Image.open(io.BytesIO(image_data))
        
        # Save the image
        image.save(filename)
        print(f"✅ Image saved as: {filename}")
        
    except Exception as e:
        print(f"❌ Error saving image: {e}")

def test_image_generation():
    """Test the image generation functionality with sample data."""
    print("\n🧪 Starting Image Generation Test...")
    print("=" * 50)
    
    # Create ImageGenerator instance
    try:
        generator = ImageGenerator()
        print("✅ ImageGenerator instance created successfully")
    except Exception as e:
        print(f"❌ Failed to create ImageGenerator: {e}")
        return
    
    # Test parameters
    test_cases = [
        {
            "topic": "The Life cycle of butterfly",
            "subject": "Science",
            "grade": "4",
            "diagram_type": "Conceptual Map",
            "language": "English",
            "additional_instructions": ""
        },
        {
            "topic": "Addition and Subtraction",
            "subject": "Mathematics",
            "grade": "2",
            "diagram_type": "Visual Guide",
            "language": "English",
            "additional_instructions": "Include simple examples with numbers 1-10"
        },
        {
            "topic": "Solar System",
            "subject": "Science",
            "grade": "5",
            "diagram_type": "Diagram",
            "language": "Hindi",
            "additional_instructions": "Show planets in order from the sun"
        }
    ]
    
    # Test each case
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}:")
        print(f"   Topic: {test_case['topic']}")
        print(f"   Subject: {test_case['subject']}")
        print(f"   Grade: {test_case['grade']}")
        print(f"   Language: {test_case['language']}")
        
        try:
            # Generate image
            print("   🔄 Generating image...")
            result = generator.generate_educational_diagram(
                topic=test_case['topic'],
                subject=test_case['subject'],
                grade=test_case['grade'],
                diagram_type=test_case['diagram_type'],
                language=test_case['language'],
                additional_instructions=test_case['additional_instructions']
            )
            
            if result['success']:
                print("   ✅ Image generated successfully!")
                
                # Save the image
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"test_image_{i}_{timestamp}.png"
                save_base64_image(result['image_data'], filename)
                
                # Print metadata
                metadata = result['metadata']
                print(f"   📊 Metadata: {metadata}")
                
            else:
                print(f"   ❌ Image generation failed: {result['error']}")
                
        except Exception as e:
            print(f"   ❌ Unexpected error: {e}")
        
        print("-" * 30)

def interactive_test():
    """Interactive test mode where user can input custom parameters."""
    print("\n🎯 Interactive Test Mode")
    print("=" * 50)
    
    try:
        generator = ImageGenerator()
        print("✅ ImageGenerator ready for interactive testing")
    except Exception as e:
        print(f"❌ Failed to initialize ImageGenerator: {e}")
        return
    
    while True:
        print("\nEnter test parameters (or 'quit' to exit):")
        
        topic = input("Topic: ").strip()
        if topic.lower() == 'quit':
            break
            
        subject = input("Subject: ").strip()
        grade = input("Grade: ").strip()
        diagram_type = input("Diagram Type (default: Conceptual Map): ").strip() or "Conceptual Map"
        language = input("Language (default: English): ").strip() or "English"
        additional_instructions = input("Additional Instructions (optional): ").strip()
        
        print("\n🔄 Generating image...")
        
        try:
            result = generator.generate_educational_diagram(
                topic=topic,
                subject=subject,
                grade=grade,
                diagram_type=diagram_type,
                language=language,
                additional_instructions=additional_instructions
            )
            
            if result['success']:
                print("✅ Image generated successfully!")
                
                # Save the image
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                safe_topic = "".join(c for c in topic if c.isalnum() or c in (' ', '-', '_')).rstrip()[:20]
                filename = f"interactive_test_{safe_topic}_{timestamp}.png"
                save_base64_image(result['image_data'], filename)
                
            else:
                print(f"❌ Image generation failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Unexpected error: {e}")

def main():
    """Main function to run the tests."""
    print("🚀 Image Generator Test Suite")
    print("=" * 50)

    # Check authentication first
    if not check_authentication():
        print("\n❌ Cannot proceed without proper authentication.")
        print("Please set up authentication and try again.")
        return

    while True:
        print("\nChoose test mode:")
        print("1. Run predefined test cases")
        print("2. Interactive test mode")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            test_image_generation()
        elif choice == '2':
            interactive_test()
        elif choice == '3':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()
