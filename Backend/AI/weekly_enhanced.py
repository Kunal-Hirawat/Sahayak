import os
import fitz  # PyMuPDF
from dotenv import load_dotenv
from datetime import datetime, timedelta
import google.generativeai as genai
import json
import tempfile

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")

# Configure Gemini (same as original weekly.py)
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the correct Gemini model (same as original)
model = genai.GenerativeModel("gemini-1.5-flash")

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using PyMuPDF (same as original weekly.py)."""
    try:
        with fitz.open(pdf_path) as doc:
            return "\n".join([page.get_text() for page in doc])
    except Exception as e:
        raise RuntimeError(f"Failed to read PDF: {e}")

def extract_text_from_uploaded_pdf(pdf_file_path):
    """Extract text from uploaded PDF file."""
    if not pdf_file_path or not os.path.exists(pdf_file_path):
        return None
    return extract_text_from_pdf(pdf_file_path)

def build_enhanced_lesson_plan_prompt(form_data, pdf_text=None):
    """Build enhanced prompt using frontend form data and optional PDF content."""
    
    # Extract form data
    subject = form_data.get('subject', 'Math')
    grade_level = form_data.get('gradeLevel', '3')
    topic = form_data.get('topic', '')
    week_start_date = form_data.get('weekStartDate', '')
    duration = form_data.get('duration', '5')
    periods_per_day = form_data.get('periodsPerDay', '1')
    period_duration = form_data.get('periodDuration', '45')
    learning_objectives = form_data.get('learningObjectives', '')
    include_assessment = form_data.get('includeAssessment', True)
    include_homework = form_data.get('includeHomework', True)
    teaching_method = form_data.get('teachingMethod', 'mixed')
    
    # Format date
    today = datetime.today().strftime("%A, %d %B %Y")
    
    # Build teaching method description
    method_descriptions = {
        'traditional': 'lecture and demonstration based teaching',
        'interactive': 'student participation and discussion focused',
        'hands-on': 'activity and experiment based learning',
        'mixed': 'combination of lecture, discussion, and hands-on activities'
    }
    method_desc = method_descriptions.get(teaching_method, 'mixed approach')
    
    # Build the prompt
    prompt = f"""
You are an experienced academic planner for Grade {grade_level} students.

📅 Today is {today}.
You will generate a detailed weekly lesson plan based on the provided information.

📝 LESSON PLAN REQUIREMENTS:
- Subject: {subject}
- Grade Level: {grade_level}
- Topic/Unit: {topic}
- Week Duration: {duration} days
- Periods per day: {periods_per_day}
- Period duration: {period_duration} minutes
- Teaching Method: {method_desc}

📚 LEARNING OBJECTIVES:
{learning_objectives if learning_objectives else f"Students will understand and apply key concepts of {topic} in {subject}"}

📋 STRUCTURE REQUIREMENTS:
- Plan for {duration} days starting from {week_start_date if week_start_date else 'Monday'}
- Each day should have {periods_per_day} period(s) of {period_duration} minutes
- Include specific topics, activities, and teaching strategies
- {"Include assessment methods and evaluation criteria" if include_assessment else "Focus on teaching without formal assessments"}
- {"Include homework assignments for each day" if include_homework else "No homework assignments needed"}

🎯 OUTPUT FORMAT:
Provide a structured daily breakdown with:
- Day and date
- Period-wise breakdown
- Specific topics to cover
- Teaching activities and methods
- Learning objectives for each period
- {"Assessment methods" if include_assessment else ""}
- {"Homework assignments" if include_homework else ""}
- Required materials and resources

📖 EDUCATIONAL GUIDELINES:
- Age-appropriate content for Grade {grade_level}
- Engaging and interactive activities
- Clear learning progression
- Practical examples and real-world connections
- Variety in teaching methods to maintain student interest

"""

    # Add PDF content if available
    if pdf_text:
        prompt += f"""
📄 CURRICULUM/SYLLABUS REFERENCE:
Use the following curriculum content as reference for planning:

----- START CURRICULUM -----
{pdf_text[:3000]}  # Limit to avoid token limits
----- END CURRICULUM -----

Align the lesson plan with the curriculum requirements and ensure coverage of specified topics.
"""
    else:
        prompt += """
📄 CURRICULUM GUIDANCE:
Since no specific curriculum is provided, create a comprehensive plan based on standard Grade {grade_level} {subject} curriculum expectations.
"""

    prompt += """
🎯 OUTPUT FORMAT REQUIREMENT:
Generate the response as a valid JSON object with the following structure:

{
  "overallGoal": "Brief description of the unit's main learning goal",
  "materials": ["List of required materials and resources"],
  "dailyPlans": [
    {
      "day": "Monday",
      "date": "YYYY-MM-DD",
      "periods": [
        {
          "periodNumber": 1,
          "duration": "45 minutes",
          "topic": "Specific topic for this period",
          "learningObjective": "What students will learn",
          "teachingActivities": ["List of specific activities"],
          "teachingMethod": "Description of teaching approach",
          "assessment": "How learning will be assessed",
          "homework": "Homework assignment (if applicable)"
        }
      ]
    }
  ],
  "weeklyAssessment": {
    "type": "Type of assessment",
    "description": "Assessment details",
    "scheduledFor": "When it will be conducted"
  }
}

IMPORTANT: Return ONLY the JSON object, no additional text or formatting.
"""

    return prompt

def parse_lesson_plan_response(response_text, form_data):
    """Parse the AI response and structure it for frontend consumption."""

    try:
        # First try to parse as JSON
        import re

        # Clean the response text to extract JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            ai_plan = json.loads(json_str)

            # Create structured response with AI data
            structured_plan = {
                "subject": form_data.get('subject', 'Math'),
                "gradeLevel": f"Grade {form_data.get('gradeLevel', '3')}",
                "topic": form_data.get('topic', ''),
                "startDate": form_data.get('weekStartDate', ''),
                "duration": f"{form_data.get('duration', '5')} days",
                "overallGoal": ai_plan.get('overallGoal', ''),
                "materials": ai_plan.get('materials', []),
                "dailyPlans": ai_plan.get('dailyPlans', []),
                "weeklyAssessment": ai_plan.get('weeklyAssessment', None),
                "summary": {
                    "totalDays": int(form_data.get('duration', '5')),
                    "periodsPerDay": form_data.get('periodsPerDay', '1'),
                    "periodDuration": f"{form_data.get('periodDuration', '45')} minutes",
                    "teachingMethod": form_data.get('teachingMethod', 'mixed'),
                    "includesAssessment": form_data.get('includeAssessment', True),
                    "includesHomework": form_data.get('includeHomework', True)
                },
                "createdBy": "AI Assistant",
                "createdAt": datetime.now().isoformat()
            }

            return structured_plan
        else:
            raise ValueError("No JSON found in response")

    except (json.JSONDecodeError, ValueError) as e:
        print(f"JSON parsing failed: {e}")
        print(f"Raw response: {response_text[:500]}...")

        # Fallback: return the raw text in the old format
        return {
            "subject": form_data.get('subject', 'Math'),
            "gradeLevel": f"Grade {form_data.get('gradeLevel', '3')}",
            "topic": form_data.get('topic', ''),
            "startDate": form_data.get('weekStartDate', ''),
            "duration": f"{form_data.get('duration', '5')} days",
            "generatedContent": response_text,  # Fallback to raw text
            "summary": {
                "totalDays": int(form_data.get('duration', '5')),
                "periodsPerDay": form_data.get('periodsPerDay', '1'),
                "periodDuration": f"{form_data.get('periodDuration', '45')} minutes",
                "teachingMethod": form_data.get('teachingMethod', 'mixed'),
                "includesAssessment": form_data.get('includeAssessment', True),
                "includesHomework": form_data.get('includeHomework', True)
            },
            "createdBy": "AI Assistant",
            "createdAt": datetime.now().isoformat()
        }

def generate_weekly_lesson_plan(form_data, pdf_file_path=None):
    """Main function to generate weekly lesson plan using form data and optional PDF."""
    try:
        # Extract PDF text if provided
        pdf_text = None
        if pdf_file_path:
            pdf_text = extract_text_from_uploaded_pdf(pdf_file_path)
            print(f"📄 PDF processed: {len(pdf_text) if pdf_text else 0} characters extracted")
        
        # Build prompt
        prompt = build_enhanced_lesson_plan_prompt(form_data, pdf_text)
        
        # Generate content using Gemini
        print("🤖 Generating lesson plan with Gemini...")
        response = model.generate_content(prompt)
        
        # Parse and structure the response
        structured_plan = parse_lesson_plan_response(response.text.strip(), form_data)
        
        return structured_plan
        
    except Exception as e:
        print(f"Error in generate_weekly_lesson_plan: {str(e)}")
        
        # Return fallback response
        return {
            "subject": form_data.get('subject', 'Math'),
            "gradeLevel": f"Grade {form_data.get('gradeLevel', '3')}",
            "topic": form_data.get('topic', 'Learning Topic'),
            "generatedContent": f"Weekly lesson plan for {form_data.get('topic', 'the specified topic')} will be created. Please try again or contact support if the issue persists.",
            "summary": {
                "totalDays": form_data.get('duration', '5'),
                "teachingMethod": form_data.get('teachingMethod', 'mixed'),
                "error": str(e)
            },
            "createdBy": "AI Assistant",
            "createdAt": datetime.now().isoformat()
        }

# Test function
if __name__ == "__main__":
    # Test the enhanced function
    test_form_data = {
        "subject": "Math",
        "gradeLevel": "3",
        "topic": "Fractions",
        "weekStartDate": "2024-01-15",
        "duration": "5",
        "periodsPerDay": "1",
        "periodDuration": "45",
        "learningObjectives": "Students will understand basic fractions and be able to identify parts of a whole",
        "includeAssessment": True,
        "includeHomework": True,
        "teachingMethod": "mixed"
    }
    
    print("🧪 Testing Enhanced Weekly Lesson Planner...")
    result = generate_weekly_lesson_plan(test_form_data)

    print("\n✅ Test Result:")
    print(f"Subject: {result['subject']}")
    print(f"Grade: {result['gradeLevel']}")
    print(f"Topic: {result['topic']}")

    if 'dailyPlans' in result and result['dailyPlans']:
        print(f"📅 Structured Data: {len(result['dailyPlans'])} days planned")
        print(f"🎯 Overall Goal: {result.get('overallGoal', 'N/A')[:100]}...")
        print(f"📚 Materials: {len(result.get('materials', []))} items")
    else:
        print(f"📝 Raw Content: {result.get('generatedContent', '')[:200]}...")

    print(f"📊 Summary: {result['summary']}")
