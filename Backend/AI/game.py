"""
Educational Game Generator for Sahayak Application
Two-stage LLM pipeline: Game Design → Code Generation
"""

import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

class GameGenerator:
    def __init__(self):
        """Initialize the Game Generator with Gemini AI."""
        print("🔧 DEBUG: Initializing GameGenerator...")
        
        # Load environment variables
        load_dotenv()
        
        # Configure Gemini AI
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            print("✅ DEBUG: API Key loaded: ✅ Yes")
            print("✅ DEBUG: Using model: gemini-2.5-pro")
        else:
            print("❌ DEBUG: API Key loaded: ❌ No")
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        print("✅ DEBUG: GameGenerator initialized successfully")

    def generate_game_design_prompt(self, subject, topic, grade, theme, difficulty, duration, context=""):
        """Generate prompt for Stage 1: Game Design LLM"""

        context_part = f"Additional Context: {context}" if context else ""

        return f"""
Design an educational game for elementary students.

REQUIREMENTS:
- Subject: {subject}
- Topic: {topic}
- Grade: {grade}
- Theme: {theme}
- Difficulty: {difficulty}
- Duration: {duration}
{context_part}

DESIGN SPECIFICATIONS:

1. GAME TYPE: Choose one (quiz, matching, puzzle, memory, drag-drop, word game)

2. GAMEPLAY:
   - Simple rules for grade {grade}
   - Clear win condition
   - 5-10 questions/challenges
   - Interactive elements

3. THEME INTEGRATION:
   - Use {theme} colors and imagery
   - Theme-appropriate characters/story
   - Consistent visual style

4. EDUCATIONAL VALUE:
   - Reinforce {topic} concepts
   - Immediate feedback on answers
   - Progress tracking
   - Encouraging messages

5. TECHNICAL NEEDS:
   - Single HTML page
   - Embedded CSS and JavaScript
   - Mobile-friendly buttons
   - Simple animations

Keep the design concise and implementable. Focus on fun, educational gameplay that teaches {topic} to grade {grade} students using the {theme} theme.
"""

    def generate_code_prompt(self, game_design, subject, topic, grade, theme):
        """Generate prompt for Stage 2: Code Generation LLM"""

        return f"""
You are an expert web developer. Create a complete HTML game based on this design.

GAME DESIGN:
{game_design}

REQUIREMENTS:
- Subject: {subject}, Topic: {topic}, Grade: {grade}, Theme: {theme}
- Single HTML file with embedded CSS and JavaScript
- Child-friendly design with large buttons and clear fonts
- Educational and fun gameplay
- Mobile responsive

CRITICAL: Return ONLY the HTML code. No explanations, no markdown, no extra text.
Start with <!DOCTYPE html> and end with </html>
Do not include ```html or ``` markers.
Do not include any text before or after the HTML code.

HTML CODE ONLY:"""

    def generate_game_design(self, subject, topic, grade, theme, difficulty, duration, context=""):
        """Stage 1: Generate comprehensive game design using Gemini AI"""
        print(f"🔧 DEBUG: Generating game design for Grade {grade}")
        print(f"🔧 DEBUG: Subject: {subject}, Topic: {topic}")
        print(f"🔧 DEBUG: Theme: {theme}, Difficulty: {difficulty}, Duration: {duration}")
        print(f"🔧 DEBUG: Context length: {len(context)} characters")

        try:
            # Generate the prompt
            prompt = self.generate_game_design_prompt(subject, topic, grade, theme, difficulty, duration, context)
            print(f"🔧 DEBUG: Generated prompt length: {len(prompt)} characters")
            print(f"🔧 DEBUG: Prompt preview:\n{prompt[:200]}...")

            # Call Gemini API
            print("🔧 DEBUG: Calling Gemini API for game design...")
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                design = response.text.strip()
                print(f"🔧 DEBUG: Gemini response length: {len(design)} characters")
                print(f"🔧 DEBUG: Design preview: {design[:200]}...")
                return design
            else:
                print("❌ DEBUG: Empty response from Gemini API")
                return "Error: Empty response from AI"

        except Exception as e:
            print(f"❌ DEBUG: Error in generate_game_design: {e}")
            raise

    def generate_game_code(self, game_design, subject, topic, grade, theme):
        """Stage 2: Generate complete HTML game code using Gemini AI"""
        print(f"🔧 DEBUG: Generating game code for Grade {grade}")
        print(f"🔧 DEBUG: Design input length: {len(game_design)} characters")

        try:
            # Generate the prompt
            prompt = self.generate_code_prompt(game_design, subject, topic, grade, theme)
            print(f"🔧 DEBUG: Generated code prompt length: {len(prompt)} characters")

            # Call Gemini API
            print("🔧 DEBUG: Calling Gemini API for code generation...")
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                code = response.text.strip()
                print(f"🔧 DEBUG: Gemini code response length: {len(code)} characters")

                # Aggressive cleaning to extract only HTML
                # Remove markdown code blocks
                if "```html" in code:
                    start = code.find("```html") + 7
                    end = code.find("```", start)
                    if end != -1:
                        code = code[start:end]
                elif "```" in code:
                    start = code.find("```") + 3
                    end = code.find("```", start)
                    if end != -1:
                        code = code[start:end]

                # Find HTML document boundaries
                doctype_start = code.find("<!DOCTYPE html>")
                if doctype_start == -1:
                    doctype_start = code.find("<html")

                html_end = code.rfind("</html>")

                if doctype_start != -1 and html_end != -1:
                    code = code[doctype_start:html_end + 7]

                # Remove any leading/trailing non-HTML text
                code = code.strip()

                # Ensure it starts with DOCTYPE or html tag
                if not code.startswith("<!DOCTYPE") and not code.startswith("<html"):
                    # Try to find the start of HTML content
                    html_start = code.find("<html")
                    if html_start != -1:
                        code = code[html_start:]
                    else:
                        doctype_start = code.find("<!DOCTYPE")
                        if doctype_start != -1:
                            code = code[doctype_start:]

                print(f"🔧 DEBUG: Cleaned code length: {len(code)} characters")
                print(f"🔧 DEBUG: Code starts with: {code[:50]}...")
                print(f"🔧 DEBUG: Code ends with: ...{code[-50:]}")

                # Validate that we have proper HTML
                if not code or len(code) < 100:
                    print("❌ DEBUG: Code too short, likely not valid HTML")
                    return "Error: Generated code too short"

                if not ("html" in code.lower() and ("head" in code.lower() or "body" in code.lower())):
                    print("❌ DEBUG: Code doesn't appear to contain valid HTML structure")
                    return "Error: Generated code doesn't contain valid HTML structure"

                print("✅ DEBUG: HTML validation passed")
                return code
            else:
                print("❌ DEBUG: Empty response from Gemini API")
                return "Error: Empty response from AI"

        except Exception as e:
            print(f"❌ DEBUG: Error in generate_game_code: {e}")
            raise

    def generate_educational_game(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main function: Two-stage pipeline to generate educational games.
        
        Args:
            form_data: Dictionary containing form parameters from frontend
            
        Returns:
            Dictionary with generated game data
        """
        print("🔧 DEBUG: Starting generate_educational_game")
        print(f"🔧 DEBUG: Received form_data: {form_data}")

        try:
            # Extract parameters
            subject = form_data.get('subject', 'Math')
            topic = form_data.get('topic', '').strip()
            grade = form_data.get('gradeLevel', '3')
            theme = form_data.get('theme', 'colorful')
            difficulty = form_data.get('difficulty', 'medium')
            duration = form_data.get('duration', 'medium')
            context = form_data.get('extractedContent', '')

            print(f"🔧 DEBUG: Extracted parameters:")
            print(f"  - Subject: {subject}")
            print(f"  - Topic: {topic}")
            print(f"  - Grade: {grade}")
            print(f"  - Theme: {theme}")
            print(f"  - Difficulty: {difficulty}")
            print(f"  - Duration: {duration}")
            print(f"  - Context length: {len(context)} characters")

            if not topic:
                print("❌ DEBUG: Topic is empty")
                return {
                    "success": False,
                    "error": "Topic cannot be empty"
                }

            # Stage 1: Generate Game Design
            print("🎮 DEBUG: Stage 1 - Generating game design...")
            game_design = self.generate_game_design(subject, topic, grade, theme, difficulty, duration, context)
            
            if game_design.startswith("Error:"):
                return {
                    "success": False,
                    "error": f"Game design generation failed: {game_design}"
                }

            # Stage 2: Generate Game Code
            print("🎮 DEBUG: Stage 2 - Generating game code...")
            game_code = self.generate_game_code(game_design, subject, topic, grade, theme)

            if game_code.startswith("Error:"):
                print("⚠️ DEBUG: AI generation failed, using fallback test game")
                game_code = self.create_simple_test_game(topic, subject, grade, theme)
                print("✅ DEBUG: Fallback game created successfully")

            # Prepare response
            result = {
                "success": True,
                "game": {
                    "html_code": game_code,
                    "design_document": game_design,
                    "metadata": {
                        "subject": subject,
                        "topic": topic,
                        "grade": grade,
                        "theme": theme,
                        "difficulty": difficulty,
                        "duration": duration,
                        "generated_at": "now"
                    }
                }
            }

            print("✅ DEBUG: Educational game generated successfully")
            return result

        except Exception as e:
            print(f"❌ DEBUG: Exception in generate_educational_game: {e}")
            import traceback
            print(f"❌ DEBUG: Traceback: {traceback.format_exc()}")
            return {
                "success": False,
                "error": str(e)
            }

    def create_simple_test_game(self, topic, subject, grade, theme):
        """Create a simple test game to verify the system works"""
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{topic} Game - Grade {grade}</title>
    <style>
        body {{
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }}
        .game-container {{
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 600px;
            width: 100%;
        }}
        h1 {{
            color: #4a5568;
            font-size: 2.5em;
            margin-bottom: 20px;
        }}
        .question {{
            font-size: 1.5em;
            margin: 20px 0;
            color: #2d3748;
        }}
        button {{
            background: #48bb78;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.2em;
            border-radius: 10px;
            margin: 10px;
            cursor: pointer;
            transition: all 0.3s;
        }}
        button:hover {{
            background: #38a169;
            transform: scale(1.05);
        }}
        .score {{
            font-size: 1.3em;
            margin: 20px 0;
            color: #2b6cb0;
        }}
    </style>
</head>
<body>
    <div class="game-container">
        <h1>🎮 {topic} Game</h1>
        <p>Welcome to your {theme} themed {subject} adventure!</p>
        <div class="score">Score: <span id="score">0</span></div>
        <div class="question" id="question">Click Start to begin!</div>
        <div id="answers"></div>
        <button onclick="startGame()">Start Game</button>
        <button onclick="nextQuestion()" id="nextBtn" style="display:none;">Next Question</button>
    </div>

    <script>
        let score = 0;
        let currentQuestion = 0;
        const questions = [
            {{q: "What is 2 + 3?", answers: ["4", "5", "6", "7"], correct: 1}},
            {{q: "What is 10 - 4?", answers: ["5", "6", "7", "8"], correct: 1}},
            {{q: "What is 3 × 2?", answers: ["5", "6", "7", "8"], correct: 1}}
        ];

        function startGame() {{
            currentQuestion = 0;
            score = 0;
            document.getElementById('score').textContent = score;
            showQuestion();
        }}

        function showQuestion() {{
            if (currentQuestion >= questions.length) {{
                document.getElementById('question').textContent = "🎉 Great job! You completed the game!";
                document.getElementById('answers').innerHTML = "";
                document.getElementById('nextBtn').style.display = 'none';
                return;
            }}

            const q = questions[currentQuestion];
            document.getElementById('question').textContent = q.q;

            let answersHtml = "";
            q.answers.forEach((answer, index) => {{
                answersHtml += `<button onclick="checkAnswer(${{index}})">${{answer}}</button>`;
            }});

            document.getElementById('answers').innerHTML = answersHtml;
            document.getElementById('nextBtn').style.display = 'none';
        }}

        function checkAnswer(selected) {{
            const q = questions[currentQuestion];
            if (selected === q.correct) {{
                score += 10;
                document.getElementById('score').textContent = score;
                document.getElementById('question').textContent = "✅ Correct! Well done!";
            }} else {{
                document.getElementById('question').textContent = "❌ Try again! The correct answer is " + q.answers[q.correct];
            }}

            document.getElementById('answers').innerHTML = "";
            document.getElementById('nextBtn').style.display = 'inline-block';
        }}

        function nextQuestion() {{
            currentQuestion++;
            showQuestion();
        }}
    </script>
</body>
</html>"""
