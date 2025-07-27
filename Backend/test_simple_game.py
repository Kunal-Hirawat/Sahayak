#!/usr/bin/env python3
"""
Simple test script to verify game generation works
"""

import os
import sys
import json

def test_simple_game():
    """Test the simple game generation"""
    print("🎮 Testing Simple Game Generation...")
    
    try:
        # Add the AI directory to path
        sys.path.append(os.path.join(os.path.dirname(__file__), 'AI'))
        
        from AI.game import GameGenerator
        
        print("✅ Successfully imported GameGenerator")
        
        # Create generator
        generator = GameGenerator()
        print("✅ GameGenerator created successfully")
        
        # Test the simple game function directly
        print("🎮 Testing simple test game...")
        simple_game = generator.create_simple_test_game("Addition", "Math", "3", "colorful")
        
        print(f"✅ Simple game generated, length: {len(simple_game)} characters")
        print(f"✅ Starts with: {simple_game[:50]}...")
        print(f"✅ Contains DOCTYPE: {'<!DOCTYPE' in simple_game}")
        print(f"✅ Contains HTML: {'<html' in simple_game}")
        print(f"✅ Contains body: {'<body' in simple_game}")
        
        # Save the simple game
        with open('simple_test_game.html', 'w', encoding='utf-8') as f:
            f.write(simple_game)
        print("✅ Simple game saved as 'simple_test_game.html'")
        
        # Test full generation with fallback
        print("\n🎮 Testing full game generation...")
        form_data = {
            "topic": "Simple Addition",
            "subject": "Math",
            "gradeLevel": "2",
            "theme": "colorful",
            "difficulty": "easy",
            "duration": "short",
            "extractedContent": ""
        }
        
        result = generator.generate_educational_game(form_data)
        
        if result['success']:
            print("✅ Full game generation successful!")
            game = result['game']
            
            print(f"✅ HTML code length: {len(game['html_code'])} characters")
            print(f"✅ HTML starts with: {game['html_code'][:50]}...")
            print(f"✅ Contains DOCTYPE: {'<!DOCTYPE' in game['html_code']}")
            print(f"✅ Contains HTML: {'<html' in game['html_code']}")
            print(f"✅ Contains body: {'<body' in game['html_code']}")
            
            # Save the full game
            with open('full_test_game.html', 'w', encoding='utf-8') as f:
                f.write(game['html_code'])
            print("✅ Full game saved as 'full_test_game.html'")
            
        else:
            print(f"❌ Full game generation failed: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    print("🎮 Simple Game Generation Test")
    print("=" * 40)
    test_simple_game()
    print("\n🎯 Test completed!")
    print("Check the generated HTML files in your browser to verify they work.")

if __name__ == "__main__":
    main()
