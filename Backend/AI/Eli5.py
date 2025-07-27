import os
from dotenv import load_dotenv
from google import genai  # google-genai SDK

load_dotenv()
KEY = os.getenv("GEMINI_API_KEY")
if not KEY:
    print("Missing GEMINI_API_KEY in .env"); exit()

client = genai.Client()

def explain_to_kid(question):
    try:
        # Detailed, structured prompt with formatting and metaphorical examples
        detailed_prompt = f"""
You are a friendly and fun educational assistant designed to help very young children (around 5 years old) understand new concepts easily.

Your task is to answer the question below in a way that is:
- Simple, clear, and kind
- Fun and relatable to a child's world
- Structured and formatted only in the required JSON format

### Question:
{question}

### Instructions:
Respond **only** using the following JSON format:
{{
"explanation": "A simple and clear explanation of the concept in 2–3 sentences using child-friendly language.",
"metaphor": "A fun metaphor or analogy that connects the concept to something a 5-year-old can relate to (like toys, food, animals, etc.).",
"example": "A short, relatable example or scenario in 1–2 sentences to help the child imagine it.",
"recap": ["Bullet point list that summarizes the main ideas in simple words."]
}}

⚠️ Do not include anything outside this JSON format. Keep the tone playful, kind, and engaging. Avoid technical words or long explanations.

Your goal is to make the concept easy, visual, and memorable for a small child. Let your explanation feel like a fun storytime!
"""

        resp = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=detailed_prompt,
            #max_output_tokens=300
        )
        return resp.text.strip()
    except Exception as e:
        return f"Error: {e}"

def main():
    print("Welcome! I can explain things like you're five 😊")
    while True:
        question = input("What would you like to learn about? (type 'exit' to quit) ")
        if question.lower() == 'exit':
            print("Goodbye! Have a fun day!"); break

        explanation = explain_to_kid(question)
        print(explanation)
        print()

if __name__ == "__main__":
    main()
