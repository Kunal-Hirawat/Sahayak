import os
import json
import requests
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Configure Gemini API
KEY = os.getenv("GEMINI_API_KEY")
if not KEY:
    print("Missing GEMINI_API_KEY in .env"); exit()

client = genai.Client()

def fetch_local_context_info(village):
    """Fetch local context information from Wikipedia"""
    try:
        search_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{village.replace(' ', '_')}"
        response = requests.get(search_url)
   
        if response.status_code == 200:
            data = response.json()
            extract = data.get("extract")
            return extract if extract else f"a village in India called {village}"
        else:
            return f"a village in India called {village}"
    except:
        return f"a village in India called {village}"

def get_language_instruction(language):
    """Get language-specific instructions and cultural context"""
    language_map = {
        'hindi': {
            'name': 'Hindi',
            'script': 'Devanagari',
            'cultural_context': 'North Indian culture with references to festivals like Diwali, Holi, foods like roti, dal, and traditions like joint families',
            'sample_words': 'paani (water), ghar (home), dost (friend), khana (food)'
        },
        'bengali': {
            'name': 'Bengali',
            'script': 'Bengali',
            'cultural_context': 'Bengali culture with references to Durga Puja, fish curry, rice, Rabindranath Tagore, and river life',
            'sample_words': 'jol (water), bari (home), bondhu (friend), khawa (food)'
        },
        'tamil': {
            'name': 'Tamil',
            'script': 'Tamil',
            'cultural_context': 'Tamil culture with references to Pongal, temple festivals, rice dishes, classical music, and literature',
            'sample_words': 'thanni (water), veedu (home), nanban (friend), saapadu (food)'
        },
        'telugu': {
            'name': 'Telugu',
            'script': 'Telugu',
            'cultural_context': 'Telugu culture with references to Ugadi, spicy foods, classical dance, and Andhra traditions',
            'sample_words': 'neellu (water), illu (home), snehithudu (friend), annam (food)'
        },
        'marathi': {
            'name': 'Marathi',
            'script': 'Devanagari',
            'cultural_context': 'Marathi culture with references to Ganesh Chaturthi, vada pav, Maharashtra traditions, and Shivaji Maharaj',
            'sample_words': 'paani (water), ghar (home), mitra (friend), jevan (food)'
        },
        'gujarati': {
            'name': 'Gujarati',
            'script': 'Gujarati',
            'cultural_context': 'Gujarati culture with references to Navratri, dhokla, business traditions, and Gandhi ji',
            'sample_words': 'paani (water), ghar (home), mitra (friend), khavanu (food)'
        },
        'kannada': {
            'name': 'Kannada',
            'script': 'Kannada',
            'cultural_context': 'Kannada culture with references to Mysore Dasara, coffee culture, classical music, and Karnataka traditions',
            'sample_words': 'neeru (water), mane (home), snehita (friend), oota (food)'
        },
        'malayalam': {
            'name': 'Malayalam',
            'script': 'Malayalam',
            'cultural_context': 'Malayalam culture with references to Onam, coconut-based foods, backwaters, and Kerala traditions',
            'sample_words': 'vellam (water), veedu (home), snehithan (friend), bhojanam (food)'
        },
        'punjabi': {
            'name': 'Punjabi',
            'script': 'Gurmukhi',
            'cultural_context': 'Punjabi culture with references to Baisakhi, lassi, bhangra, gurdwaras, and farming traditions',
            'sample_words': 'paani (water), ghar (home), yaar (friend), khana (food)'
        },
        'odia': {
            'name': 'Odia',
            'script': 'Odia',
            'cultural_context': 'Odia culture with references to Jagannath Puri, rice-based foods, classical dance, and Odisha traditions',
            'sample_words': 'paani (water), ghara (home), bandhu (friend), khana (food)'
        },
        'assamese': {
            'name': 'Assamese',
            'script': 'Bengali',
            'cultural_context': 'Assamese culture with references to Bihu, tea gardens, silk, and Northeast Indian traditions',
            'sample_words': 'paani (water), ghar (home), bandhu (friend), khabar (food)'
        },
        'english': {
            'name': 'English',
            'script': 'Latin',
            'cultural_context': 'Indian context with diverse cultural references from across India',
            'sample_words': 'water, home, friend, food'
        }
    }
    return language_map.get(language, language_map['english'])

def build_enhanced_story_prompt(params):
    """Build enhanced prompt that returns structured JSON response with language support"""

    length_map = {
        "Short": "approx. 2-4 minutes (150-250 words)",
        "Medium": "about 5-7 minutes (300-500 words)",
        "Long": "around 10-12 minutes (600-800 words)"
    }

    grade = params["grade_level"]
    village = params["local_context"]
    village_info = fetch_local_context_info(village)
    language = params.get("language", "english")
    lang_info = get_language_instruction(language)

    # Character name suggestions based on type and language
    character_suggestions = {
        "children": ["Ravi", "Priya", "Arjun", "Meera", "Kiran", "Aarav", "Ananya"],
        "animals": ["Golu the Elephant", "Chiku the Monkey", "Sheru the Tiger", "Moti the Dog", "Chintu the Rabbit"],
        "family": ["Dadi Ma", "Nana Ji", "Papa", "Mama", "Nani", "Chacha Ji"],
        "community": ["Master Ji", "Kisan Uncle", "Shopkeeper Aunty", "Doctor Sahib", "Postman Uncle"],
        "mythical": ["Hanuman", "Ganesha", "Magical Bird", "Wise Sage", "Forest Spirit"]
    }

    main_character = character_suggestions.get(params["main_characters"], ["Ravi"])[0]

    prompt = f"""
You are an expert storyteller creating engaging stories for Indian children.

🌟 CRITICAL LANGUAGE REQUIREMENT 🌟
WRITE THE ENTIRE STORY IN {lang_info['name'].upper()} LANGUAGE ONLY!
- Use {lang_info['script']} script for writing
- Include {lang_info['cultural_context']}
- Use common {lang_info['name']} words like: {lang_info['sample_words']}
- If you cannot write in {lang_info['name']}, write in English as fallback

TASK: Create a {params['story_type']} story about "{params['story_topic']}" for {grade} students.

STORY REQUIREMENTS:
- Setting: {params['story_setting']} in {village_info}
- Main character type: {params['main_characters']} 
- Story length: {length_map[params['story_length']]}
- Include dialogue: {"Yes" if params['include_dialogue'] else "No"}
- Include discussion questions: {"Yes" if params['include_discussion_questions'] else "No"}
- Moral lesson: {params.get('moral_lesson', 'To be determined from the story theme')}

CULTURAL CONTEXT:
- Use {lang_info['name']} cultural elements: {lang_info['cultural_context']}
- Include names, places, and traditions specific to {lang_info['name']} speakers
- Reference local context of {village} in {lang_info['name']} cultural perspective
- Use authentic {lang_info['name']} expressions and cultural nuances

RESPONSE FORMAT (JSON):
{{
    "title": "Engaging story title in {lang_info['name']} with main character name",
    "content": "Complete story text in {lang_info['name']} with proper paragraphs and dialogue",
    "characters": ["Main Character", "Supporting Character 1", "Supporting Character 2"],
    "setting": "Detailed setting description in {lang_info['name']}",
    "moralLesson": "Clear moral lesson in {lang_info['name']}",
    "readingTime": "Estimated reading time",
    "wordCount": "Approximate word count range",
    "gradeLevel": "{grade}",
    "language": "{language}",
    "discussionQuestions": ["Question 1 in {lang_info['name']}?", "Question 2 in {lang_info['name']}?", "Question 3 in {lang_info['name']}?"],
    "vocabulary": [{{"word": "{lang_info['name']} word1", "meaning": "simple definition in {lang_info['name']}"}}, {{"word": "{lang_info['name']} word2", "meaning": "simple definition in {lang_info['name']}"}}],
    "activities": ["Activity 1 in {lang_info['name']}", "Activity 2 in {lang_info['name']}", "Activity 3 in {lang_info['name']}"]
}}

STORY GUIDELINES:
- Write EVERYTHING in {lang_info['name']} language (title, content, questions, activities)
- Age-appropriate {lang_info['name']} language for {grade}
- Engaging plot with clear beginning, middle, end
- Relatable characters with {lang_info['name']} cultural background
- Positive values and life lessons relevant to {lang_info['name']} culture
- Include {lang_info['cultural_context']} elements naturally in the story
- {"Include natural dialogue between characters in {lang_info['name']}" if params['include_dialogue'] else "Focus on narrative without dialogue in {lang_info['name']}"}

Generate the story now:
"""

    return prompt

def generate_story_content(prompt):
    """Generate story using Gemini API"""
    try:
        # Use the new SDK format without generation_config for now
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating story: {e}")
        raise

def gen_story(data):
    """Enhanced story generation function that returns structured JSON"""
    try:
        # Build enhanced prompt
        prompt = build_enhanced_story_prompt(data)
        
        # Generate story content
        response_text = generate_story_content(prompt)
        
        # Parse JSON response
        try:
            # Find JSON in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                result = json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON parsing failed: {e}")
            print(f"Raw response: {response_text}")
            
            # Create fallback structured response
            result = create_fallback_story(data, response_text)
        
        # Validate and enhance the result
        result = validate_and_enhance_story(result, data)

        # Check for language fallback
        result = detect_language_fallback(result, data.get('language', 'english'))

        return result
        
    except Exception as e:
        print(f"Error in gen_story: {str(e)}")
        
        # Return fallback response
        return create_fallback_story(data, f"Story about {data['story_topic']}")

def create_fallback_story(data, content_text):
    """Create fallback structured response when JSON parsing fails"""
    
    character_names = {
        "children": "Ravi",
        "animals": "Golu the Elephant", 
        "family": "Dadi Ma",
        "community": "Master Ji",
        "mythical": "Wise Sage"
    }
    
    main_character = character_names.get(data["main_characters"], "Ravi")
    
    return {
        "title": f"{main_character} and the {data['story_topic']} Adventure",
        "content": content_text[:1000] + "..." if len(content_text) > 1000 else content_text,
        "characters": [main_character, "Supporting Character", "Wise Guide"],
        "setting": f"{data['story_setting']} in {data['local_context']}",
        "moralLesson": data.get('moral_lesson') or f"Understanding {data['story_topic']} helps us grow",
        "readingTime": "5-7 minutes",
        "wordCount": "300-500 words",
        "gradeLevel": data["grade_level"],
        "language": data.get("language", "english"),
        "discussionQuestions": [
            f"What did {main_character} learn about {data['story_topic']}?",
            "How can we apply this lesson in our lives?",
            f"What would you do in {main_character}'s situation?"
        ] if data.get('include_discussion_questions') else [],
        "vocabulary": [
            {"word": data['story_topic'].lower(), "meaning": "The main theme of our story"},
            {"word": "adventure", "meaning": "An exciting journey or experience"}
        ],
        "activities": [
            f"Draw your favorite scene from the story",
            f"Act out the story with friends",
            f"Write about {data['story_topic']} in your life"
        ]
    }

def validate_and_enhance_story(result, data):
    """Validate and enhance the story result"""
    
    # Ensure all required fields exist
    required_fields = ['title', 'content', 'characters', 'setting', 'moralLesson', 'readingTime', 'gradeLevel', 'language']
    for field in required_fields:
        if field not in result:
            if field == 'language':
                result[field] = data.get('language', 'english')
            else:
                result[field] = ""
    
    # Ensure arrays are actually arrays
    array_fields = ['characters', 'discussionQuestions', 'vocabulary', 'activities']
    for field in array_fields:
        if field not in result or not isinstance(result[field], list):
            result[field] = []
    
    # Add missing fields with defaults
    if not result.get('wordCount'):
        length_map = {"Short": "150-250", "Medium": "300-500", "Long": "600-800"}
        result['wordCount'] = length_map.get(data['story_length'], "300-500") + " words"
    
    if not result.get('readingTime'):
        time_map = {"Short": "2-3", "Medium": "5-7", "Long": "10-12"}
        result['readingTime'] = time_map.get(data['story_length'], "5-7") + " minutes"
    
    return result

def detect_language_fallback(result, requested_language):
    """Detect if story was generated in English despite requesting another language"""
    if requested_language == 'english':
        return result

    # Simple heuristic: check if content contains mostly English words
    content = result.get('content', '')
    title = result.get('title', '')

    # Check for common English words that wouldn't appear in other languages
    english_indicators = ['the', 'and', 'was', 'were', 'have', 'has', 'will', 'would', 'could', 'should']

    # Count English indicators in first 200 characters
    sample_text = (title + ' ' + content[:200]).lower()
    english_count = sum(1 for word in english_indicators if word in sample_text)

    # If we find many English indicators, it's likely in English
    if english_count >= 3:
        result['languageFallback'] = True
        result['fallbackMessage'] = f"Story was generated in English instead of {requested_language}. The AI may not be familiar with this topic in {requested_language}."
    else:
        result['languageFallback'] = False

    return result

# Test function
if __name__ == "__main__":
    # Test the enhanced function
    test_data = {
        "story_topic": "Friendship",
        "grade_level": "Grade 3",
        "story_length": "Medium",
        "local_context": "Mumbai, Maharashtra",
        "story_type": "moral",
        "main_characters": "children",
        "story_setting": "school",
        "include_dialogue": True,
        "include_discussion_questions": True,
        "moral_lesson": "True friends help each other",
        "language": "english"
    }
    
    result = gen_story(test_data)
    print("Test Result:")
    print(json.dumps(result, indent=2))
