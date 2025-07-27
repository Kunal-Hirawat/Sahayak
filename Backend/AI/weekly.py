import os
import fitz  # PyMuPDF
from dotenv import load_dotenv
from datetime import datetime
import google.generativeai as genai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the correct Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

# Path to your syllabus PDF
PDF_PATH = r"C:\Users\91939\Desktop\Agentic AI Hackathon\B to B Class V Maths.pdf"

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using PyMuPDF."""
    try:
        with fitz.open(pdf_path) as doc:
            return "\n".join([page.get_text() for page in doc])
    except Exception as e:
        raise RuntimeError(f"Failed to read PDF: {e}")

def create_prompt(pdf_text):
    """Builds a structured prompt for weekly teaching schedule."""
    today = datetime.today().strftime("%A, %d %B %Y")
    return f"""
You are an experienced academic planner for middle school.

📅 Today is {today}.
You will receive a syllabus and must generate a weekly teaching schedule.

📝 Instructions:
- Assume 5 teaching sessions per week.
- For each week, include:
  - Topics covered
  - Number of sessions per topic
  - Suggested teaching strategies (e.g., examples, activities)
- Add:
  - Revision every 4–5 weeks
  - Chapter tests (2 weeks after the chapter is taught)
  - Full syllabus tests every 6–8 weeks
  - Recap sessions before tests
- Ensure age-appropriate depth for middle schoolers.
- Output should be clear, structured and practical.

🔍 Format Example:
Week 1:
- Chapter 1: Whole Numbers (3 sessions)
- Chapter 2: Place Value (2 sessions)

Week 3:
- Chapter 1 Revision
- Chapter Test: Chapter 1

Week 8:
- Combined Test: Chapters 1–4 (1 revision + 1 test session)

Here is the syllabus:

----- START SYLLABUS -----
{pdf_text}
----- END SYLLABUS -----
"""

def generate_weekly_plan(pdf_path):
    """Main function to generate plan using Gemini."""
    syllabus_text = extract_text_from_pdf(pdf_path)
    prompt = create_prompt(syllabus_text)
    response = model.generate_content(prompt)
    return response.text.strip()

if __name__ == "__main__":
    print(f"\n📘 Reading PDF from: {PDF_PATH}")
    
    if not os.path.exists(PDF_PATH):
        print("❌ PDF not found. Please check the path.")
    else:
        print("⏳ Generating weekly teaching plan...\n")
        try:
            result = generate_weekly_plan(PDF_PATH)
            print("✅ Teaching Plan:\n")
            print(result)
        except Exception as e:
            print(f"❌ Error: {e}")
