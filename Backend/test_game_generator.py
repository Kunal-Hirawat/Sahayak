#!/usr/bin/env python3
"""
Test script for Educational Game Generator
Tests the two-stage LLM pipeline: Game Design → Code Generation
"""

import os
import sys
import json
import requests
import time

def test_game_generator_directly():
    """Test the game generator AI module directly"""
    print("🎮 DEBUG: Testing Game Generator AI module directly...")
    
    try:
        # Add the AI directory to path
        sys.path.append(os.path.join(os.path.dirname(__file__), 'AI'))
        
        from AI.game import GameGenerator
        
        print("✅ DEBUG: Successfully imported GameGenerator")
        
        # Create generator
        generator = GameGenerator()
        print("✅ DEBUG: GameGenerator created successfully")
        
        # Test data
        form_data = {
            "topic": "Addition and Subtraction",
            "subject": "Math",
            "gradeLevel": "3",
            "theme": "space",
            "difficulty": "medium",
            "duration": "medium",
            "extractedContent": ""
        }
        
        print(f"🎮 DEBUG: Testing with form data: {json.dumps(form_data, indent=2)}")
        
        # Generate game
        result = generator.generate_educational_game(form_data)
        
        if result['success']:
            print("✅ DEBUG: Game generator working correctly!")
            game = result['game']
            
            print(f"🎮 DEBUG: Game metadata: {game['metadata']}")
            print(f"🎮 DEBUG: HTML code length: {len(game['html_code'])} characters")
            print(f"🎮 DEBUG: Design document length: {len(game['design_document'])} characters")
            
            # Save generated game for testing
            with open('test_generated_game.html', 'w', encoding='utf-8') as f:
                f.write(game['html_code'])
            print("✅ DEBUG: Game saved as 'test_generated_game.html'")
            
        else:
            print(f"❌ DEBUG: Game generator failed: {result.get('error', 'Unknown error')}")
            
    except ImportError as e:
        print(f"❌ DEBUG: Failed to import AI module: {e}")
    except Exception as e:
        print(f"❌ DEBUG: Game generator error: {e}")

def test_backend_api():
    """Test the backend API directly"""
    print("\n🎮 DEBUG: Testing backend API directly...")
    
    # Test data
    test_data = {
        "topic": "Multiplication Tables",
        "subject": "Math",
        "gradeLevel": "4",
        "theme": "superhero",
        "difficulty": "easy",
        "duration": "short",
        "extractedContent": ""
    }
    
    print(f"🎮 DEBUG: Sending request with data: {json.dumps(test_data, indent=2)}")
    
    try:
        # Make request to backend
        response = requests.post(
            'http://localhost:5000/api/game/generate',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=120  # 2 minutes timeout for game generation
        )
        
        print(f"🎮 DEBUG: Response status: {response.status_code}")
        print(f"🎮 DEBUG: Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ DEBUG: Backend API working correctly!")
            print(f"🎮 DEBUG: Response keys: {list(result.keys())}")
            
            if result.get('status') == 'success':
                game_data = result.get('data', {})
                print(f"🎮 DEBUG: Game data keys: {list(game_data.keys())}")
                
                if 'html_code' in game_data:
                    print(f"🎮 DEBUG: HTML code length: {len(game_data['html_code'])} characters")
                    
                    # Save the generated game
                    with open('test_api_game.html', 'w', encoding='utf-8') as f:
                        f.write(game_data['html_code'])
                    print("✅ DEBUG: Game saved as 'test_api_game.html'")
                
                if 'design_document' in game_data:
                    print(f"🎮 DEBUG: Design document length: {len(game_data['design_document'])} characters")
                    
                if 'metadata' in game_data:
                    print(f"🎮 DEBUG: Metadata: {game_data['metadata']}")
                    
            else:
                print(f"❌ DEBUG: Backend returned error: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ DEBUG: HTTP Error {response.status_code}")
            print(f"❌ DEBUG: Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ DEBUG: Cannot connect to backend. Is the Flask server running on localhost:5000?")
    except requests.exceptions.Timeout:
        print("❌ DEBUG: Request timed out. Game generation might take longer...")
    except Exception as e:
        print(f"❌ DEBUG: Unexpected error: {e}")

def check_environment():
    """Check if environment is set up correctly"""
    print("🎮 DEBUG: Checking environment setup...")
    
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
    required_packages = ['google-generativeai', 'flask', 'flask-cors', 'requests']
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ DEBUG: {package} is installed")
        except ImportError:
            print(f"❌ DEBUG: {package} is NOT installed")

def test_different_themes():
    """Test different themes and configurations"""
    print("\n🎮 DEBUG: Testing different themes and configurations...")
    
    test_configs = [
        {
            "topic": "Colors and Shapes",
            "subject": "Art",
            "gradeLevel": "1",
            "theme": "colorful",
            "difficulty": "easy",
            "duration": "short"
        },
        {
            "topic": "Solar System",
            "subject": "Science",
            "gradeLevel": "5",
            "theme": "space",
            "difficulty": "hard",
            "duration": "long"
        },
        {
            "topic": "Animal Habitats",
            "subject": "Science",
            "gradeLevel": "2",
            "theme": "nature",
            "difficulty": "medium",
            "duration": "medium"
        }
    ]
    
    for i, config in enumerate(test_configs):
        print(f"\n🎮 DEBUG: Test {i+1}/3 - {config['topic']} ({config['theme']} theme)")
        
        try:
            # Add the AI directory to path
            sys.path.append(os.path.join(os.path.dirname(__file__), 'AI'))
            from AI.game import GameGenerator
            
            generator = GameGenerator()
            result = generator.generate_educational_game(config)
            
            if result['success']:
                print(f"✅ DEBUG: {config['theme']} theme game generated successfully")
                
                # Save each game with a unique name
                filename = f"test_game_{config['theme']}_{config['gradeLevel']}.html"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(result['game']['html_code'])
                print(f"✅ DEBUG: Game saved as '{filename}'")
            else:
                print(f"❌ DEBUG: Failed to generate {config['theme']} theme game: {result.get('error')}")
                
        except Exception as e:
            print(f"❌ DEBUG: Error testing {config['theme']} theme: {e}")

def main():
    """Main test function"""
    print("🎮 Educational Game Generator Test Suite")
    print("=" * 50)
    
    print("\n1. Environment Check:")
    check_environment()
    
    print("\n2. AI Module Test:")
    test_game_generator_directly()
    
    print("\n3. Theme Variety Test:")
    test_different_themes()
    
    print("\n4. Backend API Test:")
    print("Make sure your Flask server is running (python Backend/app.py)")
    input("Press Enter when server is ready...")
    test_backend_api()
    
    print("\n🎯 Test Summary:")
    print("- Check the console output above for any ❌ errors")
    print("- All ✅ items should be working correctly")
    print("- Generated HTML games should be playable in browser")
    print("\n📱 Frontend Testing:")
    print("- Navigate to /create/game in your Sahayak app")
    print("- Fill out the form and generate a game")
    print("- Check browser console for debug messages")
    print("- Test the Play Game and Download buttons")

if __name__ == "__main__":
    main()
