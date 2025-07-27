#!/usr/bin/env python3
"""
Simple test script for the ImageGenerator class
Quick and easy way to test image generation with minimal setup.
"""

import os
import sys
import base64
from PIL import Image
import io

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from image import ImageGenerator

def save_image_from_base64(base64_string, filename):
    """Save base64 image data to a PNG file."""
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    image.save(filename)
    print(f"Image saved as: {filename}")

def main():
    print("Testing Image Generator...")

    # Create generator instance
    try:
        generator = ImageGenerator()
        print("✅ ImageGenerator created successfully")
    except Exception as e:
        print(f"❌ Failed to create ImageGenerator: {e}")
        print("\n📋 To fix authentication, run:")
        print("gcloud auth application-default login")
        return
    
    # Test with comprehensive parameters
    result = generator.generate_educational_diagram(
        topic="The Life cycle of butterfly",
        subject="Science",
        grade="4",
        diagram_type="Diagram",
        language="English",
        complexity="medium",
        color_scheme="colorful",
        include_labels=True,
        include_explanation=True,
        size="medium",
        style="simple"
    )
    
    if result['success']:
        print("✅ Success! Image generated.")
        print(f"Metadata: {result['metadata']}")
        
        # Save the image
        save_image_from_base64(result['image_data'], "test_output.png")
        
    else:
        print(f"❌ Failed: {result['error']}")

if __name__ == "__main__":
    main()
