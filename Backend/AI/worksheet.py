import os
import fitz  # PyMuPDF
import base64
import io
from typing import Dict, List, Any
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import google.generativeai as genai

class WorksheetGenerator:
    def __init__(self):
        """Initialize the worksheet generator with Gemini AI."""
        print("🔧 DEBUG: Initializing WorksheetGenerator...")

        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        print(f"🔧 DEBUG: API Key loaded: {'✅ Yes' if self.api_key else '❌ No'}")

        if not self.api_key:
            print("❌ DEBUG: GEMINI_API_KEY not found in .env file")
            raise ValueError("❌ GEMINI_API_KEY not found in .env")

        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("models/gemini-1.5-flash")
            print("✅ DEBUG: WorksheetGenerator initialized successfully")
        except Exception as e:
            print(f"❌ DEBUG: Failed to initialize Gemini model: {e}")
            raise

    def extract_pdf_text(self, path):
        """Extract text from PDF file."""
        if not path or not os.path.exists(path):
            return ""
        text = ""
        try:
            with fitz.open(path) as doc:
                for page in doc:
                    text += page.get_text()
            return text.strip()
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""

    def format_math_problem_vertically(self, problem):
        """Format math problems for vertical display."""
        print(f"🔧 DEBUG: Formatting math problem: {problem}")

        # Skip formatting for multiple choice questions (contains A), B), C), D))
        if any(choice in problem for choice in ['A)', 'B)', 'C)', 'D)']):
            print(f"🔧 DEBUG: Skipping formatting for multiple choice question")
            return problem

        # Skip formatting for questions with question marks or equals signs followed by choices
        if '= ?' in problem or '=?' in problem:
            print(f"🔧 DEBUG: Skipping formatting for question with choices")
            return problem

        problem = problem.replace("×", "x")  # Normalize operator
        ops = ['+', '-', 'x']

        for op in ops:
            if op in problem and problem.count(op) == 1:  # Only format simple two-number problems
                try:
                    parts = problem.split(op)
                    if len(parts) == 2:
                        a, b = [num.strip() for num in parts]

                        # Check if both parts are simple numbers (no spaces, letters, etc.)
                        if a.replace('.', '').replace(',', '').isdigit() and b.replace('.', '').replace(',', '').isdigit():
                            max_len = max(len(a), len(b))
                            a = a.rjust(max_len)
                            b = b.rjust(max_len)
                            line = "_" * max_len
                            sign = '+' if op == '+' else '-' if op == '-' else '×'
                            formatted = f"  {a}\n{sign} {b}\n{line}"
                            print(f"🔧 DEBUG: Formatted as vertical: {formatted.replace(chr(10), ' | ')}")
                            return formatted
                except Exception as e:
                    print(f"🔧 DEBUG: Error formatting {problem}: {e}")
                    break

        # For fractions
        if '/' in problem and any(op in problem for op in ops):
            return f"{problem}\n(Arrange and solve the fractions vertically if possible)"

        if any(' ' in part and '/' in part for part in problem.split()):
            return f"{problem}\n(Arrange and solve the mixed fractions vertically)"

        print(f"🔧 DEBUG: No formatting applied, returning as-is")
        return problem

    def create_prompt(self, subject, topic, num_qns, grade, difficulty, qtype, context=""):
        """Create AI prompt for question generation."""
        context_part = f"\nHere is some syllabus context:\n{context}" if context else ""

        if subject.lower() in ["math", "mathematics"]:
            return f"""
You are a primary school math teacher creating a printable worksheet for kids.

🧮 Instructions:
- Generate {num_qns} math problems on the topic: "{topic}".
- Grade: {grade}
- Level: {difficulty}
- Type: {qtype}
- Do NOT include answers or explanations.
{context_part}

🧾 Question Type Formatting:
- **Multiple Choice**: "23 + 56 = ? A) 79 B) 89 C) 69 D) 99"
- **True/False**: "23 + 56 = 79 (True or False)"
- **Fill-in-the-blank**: "23 + 56 = ____"
- **Short Answer**: "What is 23 + 56?"
- **Matching**: "Match: 23 + 56 → [blank for answer]"
- **Word Problems**: "Sarah has 23 apples. She buys 56 more. How many apples does she have now?"

🧾 Math Guidelines:
- For simple arithmetic, use TWO numbers only
- Addition: e.g., "23 + 56" or "145 + 287" (not "23 + 56 + 12")
- Subtraction: e.g., "89 - 34" or "456 - 178"
- Multiplication: e.g., "7 × 8" or "25 × 4"

Grade {grade} appropriate number ranges:
- Grade 1-2: Numbers 1-100
- Grade 3-4: Numbers 1-1000
- Grade 5+: Numbers 1-10000

Only give questions, one per line. No solutions or commentary.
"""

        else:
            return f"""
You are a knowledgeable and friendly Grade {grade} {subject} teacher.

✍️ Task:
- Generate {num_qns} {difficulty} level {qtype} questions on the topic: "{topic}".
- Format them clearly for Grade {grade} students.
- Number the questions.
- Do NOT include answers or explanations.
{context_part}

🧾 Question Type Formatting:
- **Multiple Choice**: "Question text? A) Option 1 B) Option 2 C) Option 3 D) Option 4"
- **True/False**: "Statement here (True or False)"
- **Fill-in-the-blank**: "Question with _____ blank spaces"
- **Short Answer**: "Direct question requiring brief response"
- **Matching**: "Match the following: Item 1 → [blank]"
- **Word Problems**: "Real-world scenario with question"

Make sure to follow the exact format for {qtype} questions.
"""

    def generate_questions(self, subject, topic, grade, num_qns, difficulty, qtype, context=""):
        """Generate questions using Gemini AI."""
        print(f"🔧 DEBUG: Generating questions for Grade {grade}")
        print(f"🔧 DEBUG: Subject: {subject}, Topic: {topic}")
        print(f"🔧 DEBUG: Questions: {num_qns}, Difficulty: {difficulty}, Type: {qtype}")
        print(f"🔧 DEBUG: Context length: {len(context)} characters")

        try:
            prompt = self.create_prompt(subject, topic, num_qns, grade, difficulty, qtype, context)
            print(f"🔧 DEBUG: Generated prompt length: {len(prompt)} characters")
            print(f"🔧 DEBUG: Prompt preview: {prompt[:200]}...")

            print("🔧 DEBUG: Calling Gemini API...")
            response = self.model.generate_content(prompt)

            result = response.text.strip()
            print(f"🔧 DEBUG: Gemini response length: {len(result)} characters")
            print(f"🔧 DEBUG: Response preview: {result[:200]}...")

            return result
        except Exception as e:
            print(f"❌ DEBUG: Error in generate_questions: {e}")
            raise

    def generate_mixed_questions(self, subject, topic, grade, num_qns, difficulty_levels, question_types, context=""):
        """Generate questions with mixed types and difficulties"""
        print(f"🔧 DEBUG: Generating mixed questions for Grade {grade}")
        print(f"🔧 DEBUG: Subject: {subject}, Topic: {topic}")
        print(f"🔧 DEBUG: Questions: {num_qns}, Difficulties: {difficulty_levels}, Types: {question_types}")
        print(f"🔧 DEBUG: Context length: {len(context)} characters")

        try:
            # Distribute questions across different types and difficulties
            questions_per_type = max(1, num_qns // len(question_types))
            remaining_questions = num_qns % len(question_types)

            all_questions = []
            question_number = 1

            for i, qtype in enumerate(question_types):
                # Calculate how many questions for this type
                questions_for_this_type = questions_per_type
                if i < remaining_questions:
                    questions_for_this_type += 1

                # Cycle through difficulties for variety
                difficulty = difficulty_levels[i % len(difficulty_levels)]

                print(f"🔧 DEBUG: Generating {questions_for_this_type} {qtype} questions at {difficulty} level")

                # Generate questions for this type
                type_questions = self.generate_questions(
                    subject=subject,
                    topic=topic,
                    grade=grade,
                    num_qns=questions_for_this_type,
                    difficulty=difficulty,
                    qtype=qtype,
                    context=context
                )

                # Add to all questions
                if type_questions and not type_questions.startswith("Error"):
                    # Split and renumber questions
                    questions_lines = [line.strip() for line in type_questions.split('\n') if line.strip()]
                    for line in questions_lines:
                        if line and not line.startswith('Error'):
                            # Remove existing numbering and add new numbering
                            clean_line = line
                            if line[0].isdigit() and '.' in line[:5]:
                                clean_line = line.split('.', 1)[1].strip()

                            all_questions.append(f"{question_number}. {clean_line}")
                            question_number += 1

            result = '\n'.join(all_questions)
            print(f"🔧 DEBUG: Generated {len(all_questions)} mixed questions total")
            return result

        except Exception as e:
            print(f"❌ DEBUG: Exception in generate_mixed_questions: {e}")
            # Fallback to single type
            return self.generate_questions(
                subject=subject,
                topic=topic,
                grade=grade,
                num_qns=num_qns,
                difficulty=difficulty_levels[0] if difficulty_levels else 'medium',
                qtype=question_types[0] if question_types else 'multiple-choice',
                context=context
            )

    def generate_pdf_to_base64(self, questions, subject, grade, topic):
        """Generate PDF and return as base64 string."""
        print(f"🔧 DEBUG: Generating PDF for Grade {grade}")
        print(f"🔧 DEBUG: Questions text length: {len(questions)} characters")

        try:
            # Create PDF in memory
            buffer = io.BytesIO()
            c = canvas.Canvas(buffer, pagesize=A4)
            _, height = A4  # width not used, so using underscore
            y = height - 80

            # Header
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, height - 50, f"📘 {subject.title()} Worksheet - Grade {grade}")

            # Topic
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, height - 70, f"Topic: {topic}")

            c.setFont("Helvetica", 12)
            y = height - 100

            # Questions
            question_lines = questions.splitlines()
            print(f"🔧 DEBUG: Processing {len(question_lines)} question lines")

            for i, line in enumerate(question_lines):
                # Skip empty lines
                if not line.strip():
                    continue

                print(f"🔧 DEBUG: Processing line {i+1}: {line[:50]}...")

                try:
                    if subject.lower() in ["math", "mathematics","maths"] and any(op in line for op in ['+', '-', 'x', '×']):
                        formatted = self.format_math_problem_vertically(line)
                        for subline in formatted.splitlines():
                            if subline.strip():  # Skip empty sublines
                                c.drawString(70, y, subline)
                                y -= 18
                        y -= 10
                    else:
                        c.drawString(70, y, line)
                        y -= 18

                    if y < 100:
                        c.showPage()
                        c.setFont("Helvetica", 12)
                        y = height - 100

                except Exception as e:
                    print(f"⚠️ DEBUG: Error processing line '{line}': {e}")
                    # Fallback: just draw the line as-is
                    c.drawString(70, y, line)
                    y -= 18

            c.save()
            print("🔧 DEBUG: PDF creation completed")

            # Convert to base64
            buffer.seek(0)
            pdf_data = buffer.getvalue()
            pdf_base64 = base64.b64encode(pdf_data).decode()
            buffer.close()

            print(f"🔧 DEBUG: PDF converted to base64, length: {len(pdf_base64)} characters")
            return pdf_base64

        except Exception as e:
            print(f"❌ DEBUG: Error in generate_pdf_to_base64: {e}")
            raise

    def generate_worksheets(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate worksheets based on form data.

        Args:
            form_data: Dictionary containing form parameters

        Returns:
            Dictionary with generated worksheets for each grade
        """
        print("🔧 DEBUG: Starting generate_worksheets")
        print(f"🔧 DEBUG: Received form_data: {form_data}")

        try:
            # Extract parameters
            subject = form_data.get('subject', 'Math')
            topic = form_data.get('topic', '').strip()
            grade_levels = form_data.get('gradeLevel', ['3'])
            difficulty_levels = form_data.get('difficultyLevels', ['medium'])
            question_types = form_data.get('questionTypes', ['multiple-choice'])
            question_count = int(form_data.get('questionCount', '10'))
            time_limit = form_data.get('timeLimit', '30')
            context = form_data.get('extractedContent', '')

            print(f"🔧 DEBUG: Extracted parameters:")
            print(f"  - Subject: {subject}")
            print(f"  - Topic: {topic}")
            print(f"  - Grade levels: {grade_levels}")
            print(f"  - Difficulty levels: {difficulty_levels}")
            print(f"  - Question types: {question_types}")
            print(f"  - Question count: {question_count}")
            print(f"  - Time limit: {time_limit}")
            print(f"  - Context length: {len(context)} characters")

            if not topic:
                print("❌ DEBUG: Topic is empty")
                return {
                    "success": False,
                    "error": "Topic cannot be empty"
                }

            worksheets = {}
            print(f"🔧 DEBUG: Will generate worksheets for {len(grade_levels)} grades")

            # Generate worksheet for each grade level
            for i, grade in enumerate(grade_levels, 1):
                print(f"🔧 DEBUG: Processing grade {grade} ({i}/{len(grade_levels)})")

                # Use all selected difficulties and question types
                print(f"🔧 DEBUG: Using difficulties: {difficulty_levels}, question types: {question_types}")

                # Generate questions with mixed types and difficulties
                print(f"🔧 DEBUG: Generating questions for grade {grade}...")
                questions = self.generate_mixed_questions(
                    subject=subject,
                    topic=topic,
                    grade=grade,
                    num_qns=question_count,
                    difficulty_levels=difficulty_levels,
                    question_types=question_types,
                    context=context
                )

                # Generate PDF
                print(f"🔧 DEBUG: Generating PDF for grade {grade}...")
                pdf_base64 = self.generate_pdf_to_base64(questions, subject, grade, topic)

                worksheets[grade] = {
                    "pdf_data": pdf_base64,
                    "questions": questions.split('\n'),
                    "metadata": {
                        "subject": subject,
                        "topic": topic,
                        "grade": grade,
                        "difficulty": difficulty_levels,
                        "question_types": question_types,
                        "question_count": question_count,
                        "time_limit": time_limit
                    }
                }

                print(f"✅ DEBUG: Completed worksheet for grade {grade}")

            print(f"✅ DEBUG: All worksheets generated successfully")
            return {
                "success": True,
                "worksheets": worksheets
            }

        except Exception as e:
            print(f"❌ DEBUG: Exception in generate_worksheets: {e}")
            import traceback
            print(f"❌ DEBUG: Traceback: {traceback.format_exc()}")
            return {
                "success": False,
                "error": str(e)
            }

# Global instance will be created when needed
worksheet_generator = None

def get_worksheet_generator():
    """Get or create the global WorksheetGenerator instance."""
    global worksheet_generator
    if worksheet_generator is None:
        worksheet_generator = WorksheetGenerator()
    return worksheet_generator

# ----------- Main Logic -----------

if __name__ == "__main__":
    print("🎓 Welcome to the Assignment Generator!")

    generator = WorksheetGenerator()

    grade = input("Grade: ")
    subject = input("Subject: ")
    topic = input("Topic: ")
    num_qns = input("Number of Questions: ")
    time_limit = input("Time Limit (mins): ")
    difficulty = input("Difficulty (easy/medium/hard): ").lower()
    qtype = input("Question Type (MCQ/Fill in the Blanks/Short Answer/etc.): ")

    context_path = input("📎 (Optional) Enter path to context PDF (or leave blank): ").strip()
    context_text = generator.extract_pdf_text(context_path)

    print("🧠 Generating questions using Gemini...")
    output = generator.generate_questions(subject, topic, grade, num_qns, difficulty, qtype, context_text)

    print("📄 Creating PDF...")
    pdf_base64 = generator.generate_pdf_to_base64(output, subject, grade, topic)
    print(f"✅ PDF generated (base64 length: {len(pdf_base64)})")
