from google import genai
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
KEY = os.getenv("GEMINI_API_KEY")
if not KEY:
    print("Missing GEMINI_API_KEY in .env"); exit()

client = genai.Client()

def get_eli5_language_instruction(language):
    """Get language-specific instructions and educational context for ELI5"""
    language_map = {
        'hindi': {
            'name': 'Hindi',
            'script': 'Devanagari',
            'educational_context': 'North Indian educational context with examples like गाय (cow), पेड़ (tree), सूरज (sun), स्कूल (school)',
            'cultural_examples': 'रोटी बनाना (making roti), खेल खेलना (playing games), दिवाली मनाना (celebrating Diwali)',
            'sample_words': 'पानी (water), घर (home), दोस्त (friend), पढ़ना (study)'
        },
        'bengali': {
            'name': 'Bengali',
            'script': 'Bengali',
            'educational_context': 'Bengali educational context with examples like গরু (cow), গাছ (tree), সূর্য (sun), স্কুল (school)',
            'cultural_examples': 'মাছ ধরা (fishing), পুজো করা (doing puja), ভাত খাওয়া (eating rice)',
            'sample_words': 'জল (water), বাড়ি (home), বন্ধু (friend), পড়া (study)'
        },
        'tamil': {
            'name': 'Tamil',
            'script': 'Tamil',
            'educational_context': 'Tamil educational context with examples like மாடு (cow), மரம் (tree), சூரியன் (sun), பள்ளி (school)',
            'cultural_examples': 'சாதம் சமைப்பது (cooking rice), கோலம் போடுவது (drawing kolam), பொங்கல் கொண்டாடுவது (celebrating Pongal)',
            'sample_words': 'தண்ணீர் (water), வீடு (home), நண்பன் (friend), படிப்பு (study)'
        },
        'telugu': {
            'name': 'Telugu',
            'script': 'Telugu',
            'educational_context': 'Telugu educational context with examples like ఆవు (cow), చెట్టు (tree), సూర్యుడు (sun), పాఠశాల (school)',
            'cultural_examples': 'అన్నం వండటం (cooking rice), ఉగాది జరుపుకోవడం (celebrating Ugadi), నృత్యం చేయడం (dancing)',
            'sample_words': 'నీళ్లు (water), ఇల్లు (home), స్నేహితుడు (friend), చదువు (study)'
        },
        'marathi': {
            'name': 'Marathi',
            'script': 'Devanagari',
            'educational_context': 'Marathi educational context with examples like गाय (cow), झाड (tree), सूर्य (sun), शाळा (school)',
            'cultural_examples': 'वडा पाव खाणे (eating vada pav), गणेश उत्सव साजरा करणे (celebrating Ganesh festival)',
            'sample_words': 'पाणी (water), घर (home), मित्र (friend), अभ्यास (study)'
        },
        'gujarati': {
            'name': 'Gujarati',
            'script': 'Gujarati',
            'educational_context': 'Gujarati educational context with examples like ગાય (cow), ઝાડ (tree), સૂર્ય (sun), શાળા (school)',
            'cultural_examples': 'ઢોકળા બનાવવું (making dhokla), નવરાત્રિ ઉજવવી (celebrating Navratri)',
            'sample_words': 'પાણી (water), ઘર (home), મિત્ર (friend), અભ્યાસ (study)'
        },
        'kannada': {
            'name': 'Kannada',
            'script': 'Kannada',
            'educational_context': 'Kannada educational context with examples like ಹಸು (cow), ಮರ (tree), ಸೂರ್ಯ (sun), ಶಾಲೆ (school)',
            'cultural_examples': 'ಕಾಫಿ ಕುಡಿಯುವುದು (drinking coffee), ದಸರಾ ಆಚರಿಸುವುದು (celebrating Dasara)',
            'sample_words': 'ನೀರು (water), ಮನೆ (home), ಸ್ನೇಹಿತ (friend), ಅಧ್ಯಯನ (study)'
        },
        'malayalam': {
            'name': 'Malayalam',
            'script': 'Malayalam',
            'educational_context': 'Malayalam educational context with examples like പശു (cow), മരം (tree), സൂര്യൻ (sun), സ്കൂൾ (school)',
            'cultural_examples': 'തേങ്ങാ വെള്ളം കുടിക്കുക (drinking coconut water), ഓണം ആഘോഷിക്കുക (celebrating Onam)',
            'sample_words': 'വെള്ളം (water), വീട് (home), സുഹൃത്ത് (friend), പഠനം (study)'
        },
        'punjabi': {
            'name': 'Punjabi',
            'script': 'Gurmukhi',
            'educational_context': 'Punjabi educational context with examples like ਗਾਂ (cow), ਰੁੱਖ (tree), ਸੂਰਜ (sun), ਸਕੂਲ (school)',
            'cultural_examples': 'ਲੱਸੀ ਪੀਣਾ (drinking lassi), ਬੈਸਾਖੀ ਮਨਾਉਣਾ (celebrating Baisakhi), ਭੰਗੜਾ ਕਰਨਾ (doing bhangra)',
            'sample_words': 'ਪਾਣੀ (water), ਘਰ (home), ਦੋਸਤ (friend), ਪੜ੍ਹਾਈ (study)'
        },
        'odia': {
            'name': 'Odia',
            'script': 'Odia',
            'educational_context': 'Odia educational context with examples like ଗାଈ (cow), ଗଛ (tree), ସୂର୍ଯ୍ୟ (sun), ବିଦ୍ୟାଳୟ (school)',
            'cultural_examples': 'ଭାତ ଖାଇବା (eating rice), ଜଗନ୍ନାଥ ପୂଜା (Jagannath worship), ରଥଯାତ୍ରା (Rath Yatra)',
            'sample_words': 'ପାଣି (water), ଘର (home), ବନ୍ଧୁ (friend), ପଢ଼ା (study)'
        },
        'assamese': {
            'name': 'Assamese',
            'script': 'Bengali',
            'educational_context': 'Assamese educational context with examples like গৰু (cow), গছ (tree), সূৰ্য (sun), বিদ্যালয় (school)',
            'cultural_examples': 'চাহ খোৱা (drinking tea), বিহু উৎসৱ (Bihu festival), গামোচা পিন্ধা (wearing gamosa)',
            'sample_words': 'পানী (water), ঘৰ (home), বন্ধু (friend), পঢ়া (study)'
        },
        'english': {
            'name': 'English',
            'script': 'Latin',
            'educational_context': 'Indian educational context with familiar examples like cow, tree, sun, school',
            'cultural_examples': 'cooking food, playing games, celebrating festivals, helping family',
            'sample_words': 'water, home, friend, study'
        }
    }
    return language_map.get(language, language_map['english'])

def explain_to_kid(topic, grade_level, subject, local_context, complexity, include_analogy, include_example, language='english'):
    """
    Enhanced ELI5 function that adapts to frontend inputs and returns structured explanation
    
    Args:
        topic (str): The topic to explain
        grade_level (str): Grade level (1-8)
        subject (str): Subject area (Math, Science, English, etc.)
        local_context (str): Local context (city, state, country)
        complexity (str): Complexity level (simple, moderate, detailed)
        include_analogy (bool): Whether to include metaphor/analogy
        include_example (bool): Whether to include real-world example
    
    Returns:
        dict: Structured response with explanation, metaphor, example, recap
    """
    
    try:
        # Get language-specific instructions
        lang_info = get_eli5_language_instruction(language)

        # Map complexity levels to age-appropriate language
        complexity_mapping = {
            'simple': 'very simple language suitable for a 6-8 year old',
            'moderate': 'simple but slightly detailed language for a 9-11 year old',
            'detailed': 'clear and comprehensive language for a 12-14 year old'
        }

        age_guidance = complexity_mapping.get(complexity, 'simple language')

        # Build dynamic prompt based on inputs with language support
        prompt = f"""
You are an expert teacher explaining concepts to children in India.

🌟 CRITICAL LANGUAGE REQUIREMENT 🌟
EXPLAIN EVERYTHING IN {lang_info['name'].upper()} LANGUAGE ONLY!
- Use {lang_info['script']} script for writing
- Include {lang_info['educational_context']}
- Use {lang_info['cultural_examples']} for analogies
- Use simple {lang_info['name']} words like: {lang_info['sample_words']}
- If you cannot explain in {lang_info['name']}, explain in English as fallback

TASK: Explain "{topic}" from {subject} subject to a Grade {grade_level} student in {lang_info['name']}.

CONTEXT:
- Student is from {local_context}
- Use {age_guidance} in {lang_info['name']}
- Subject area: {subject}
- Include {lang_info['name']} cultural context and examples

REQUIREMENTS:
1. EXPLANATION: Provide a clear, simple explanation in {lang_info['name']}
2. METAPHOR: {"Create a relatable metaphor using " + lang_info['cultural_examples'] if include_analogy else "Skip metaphor section"}
3. EXAMPLE: {"Give a real-world example from " + lang_info['name'] + " cultural context" if include_example else "Skip example section"}
4. RECAP: List 3-4 key points to remember in {lang_info['name']}

RESPONSE FORMAT (JSON):
{{
    "explanation": "Clear explanation in {lang_info['name']} using {age_guidance}",
    "metaphor": "{"Relatable metaphor/analogy in " + lang_info['name'] if include_analogy else ""}",
    "example": "{"Real-world example in " + lang_info['name'] + " context" if include_example else ""}",
    "recap": ["Key point 1 in {lang_info['name']}", "Key point 2 in {lang_info['name']}", "Key point 3 in {lang_info['name']}"],
    "language": "{language}"
}}

GUIDELINES:
- Write EVERYTHING in {lang_info['name']} language (explanation, metaphor, example, recap)
- Use {lang_info['educational_context']} appropriately
- Reference {lang_info['cultural_examples']} for analogies
- Make it engaging and fun for {lang_info['name']}-speaking children
- Ensure accuracy while keeping it simple in {lang_info['name']}
- Use {local_context} specific examples in {lang_info['name']} context

Generate the explanation now in {lang_info['name']}:
"""

        # Initialize the model
        # model = genai.GenerativeModel('gemini-2.5-pro')
        # client = genai.Client()
        # Generate response
        # response = model.generate_content(prompt)

        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=prompt,
            #max_output_tokens=300
        )
        
        # Parse the response
        response_text = response.text.strip()
        
        # Try to extract JSON from response
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
            # Fallback: create structured response from text
            print(f"JSON parsing failed: {e}")
            print(f"Raw response: {response_text}")
            
            # Create fallback response
            result = {
                "explanation": response_text[:500] + "..." if len(response_text) > 500 else response_text,
                "metaphor": "Think of it like something familiar from your daily life!" if include_analogy else "",
                "example": f"You can see this in {local_context} around you!" if include_example else "",
                "recap": [
                    f"Remember: {topic} is important in {subject}",
                    "Ask your teacher if you have questions",
                    "Practice makes perfect!"
                ],
                "language": language
            }
        
        # Validate and clean the result
        if not isinstance(result, dict):
            raise ValueError("Invalid response format")
        
        # Ensure all required fields exist
        required_fields = ['explanation', 'metaphor', 'example', 'recap', 'language']
        for field in required_fields:
            if field not in result:
                if field == 'language':
                    result[field] = language
                else:
                    result[field] = ""

        # Ensure recap is a list
        if not isinstance(result['recap'], list):
            result['recap'] = [str(result['recap'])]

        # Clean empty fields based on user preferences
        if not include_analogy:
            result['metaphor'] = ""
        if not include_example:
            result['example'] = ""

        # Check for language fallback
        result = detect_eli5_language_fallback(result, language)

        return result
        
    except Exception as e:
        print(f"Error in explain_to_kid: {str(e)}")
        
        # Return fallback response
        return {
            "explanation": f"I'd love to explain {topic} to you! {topic} is an important concept in {subject} that we can understand step by step.",
            "metaphor": f"Think of {topic} like something you see every day!" if include_analogy else "",
            "example": f"You can find examples of {topic} in {local_context}!" if include_example else "",
            "recap": [
                f"{topic} is a key concept in {subject}",
                "Learning takes time and practice",
                "Ask questions when you're curious!"
            ],
            "language": language,
            "languageFallback": True,
            "fallbackMessage": f"Explanation provided in English instead of {language}. Try simpler topics for better {language} support."
        }

def detect_eli5_language_fallback(result, requested_language):
    """Detect if ELI5 explanation was generated in English despite requesting another language"""
    if requested_language == 'english':
        result['languageFallback'] = False
        return result

    # Check explanation, metaphor, example for English indicators
    content_to_check = [
        result.get('explanation', ''),
        result.get('metaphor', ''),
        result.get('example', '')
    ]

    # Combine all content for analysis
    combined_content = ' '.join(content_to_check).lower()

    # English indicators that are unlikely to appear in other languages
    english_indicators = ['the', 'and', 'is', 'are', 'like', 'when', 'how', 'this', 'that', 'with', 'for']

    # Count English indicators in first 300 characters
    sample_text = combined_content[:300]
    english_count = sum(1 for word in english_indicators if f' {word} ' in f' {sample_text} ')

    # If we find many English indicators, it's likely in English
    if english_count >= 4:
        result['languageFallback'] = True
        result['fallbackMessage'] = f"Explanation provided in English instead of {requested_language}. The AI may not be familiar with this topic in {requested_language}."
    else:
        result['languageFallback'] = False

    return result

# Test function
if __name__ == "__main__":
    # Test the function with different languages
    test_languages = ['english', 'hindi', 'tamil']

    for lang in test_languages:
        print(f"\n🧪 Testing ELI5 in {lang.title()}:")
        print("=" * 40)

        test_result = explain_to_kid(
            topic="Photosynthesis",
            grade_level="4",
            subject="Science",
            local_context="Mumbai, Maharashtra",
            complexity="simple",
            include_analogy=True,
            include_example=True,
            language=lang
        )

        print(f"Language: {test_result.get('language', 'N/A')}")
        print(f"Fallback: {test_result.get('languageFallback', False)}")
        print(f"Explanation: {test_result.get('explanation', '')[:100]}...")

        if test_result.get('languageFallback'):
            print(f"Fallback Message: {test_result.get('fallbackMessage', 'N/A')}")

        print(json.dumps(test_result, indent=2, ensure_ascii=False))
