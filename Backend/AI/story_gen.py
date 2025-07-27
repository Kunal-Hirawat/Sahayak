from flask import Flask, request, jsonify
import os
import google.generativeai as genai
import requests
from dotenv import load_dotenv

load_dotenv()


# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-flash")  # or models/gemini-1.5-flash-latest

# def generate_story(prompt):
#     response = model.generate_content(prompt)
#     return response.text

def generate_story(prompt):
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.7,        # creativity (0.2–1.0 is typical)
            max_output_tokens=8000  # max number of tokens in the story
        )
    )
    return response.text


def fetch_local_context_info(village):
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

def build_story_prompt(params):
    length_map = {
        "Small": "approx. 2-4 minutes",
        "Medium": "about 5-7 minutes",
        "Long": "around 13-17 minutes"
    }

    grade = params["grade_level"]
    village = params["local_context"]
    village_info = fetch_local_context_info(village)

    prompt_lines = [
        f"You are a gifted storyteller creating an engaging {params['story_type']} for {grade} students.",
        f"The story should be about \"{params['story_topic']}\" and take place in {village_info}.",
        f"It should be structured to fit into a reading of {length_map[params['story_length']]}.",
        f"Main characters: {params['main_characters']}. Setting: {params['story_setting']}, in the context of local village life."
    ]

    if params.get("moral_lesson"):
        prompt_lines.append(f"The narrative should clearly illustrate the moral lesson: \"{params['moral_lesson']}\".")

    if params["include_dialogue"]:
        prompt_lines.append("Include short, age -appropriate dialogues between characters to make it vivid.")
    else:
        prompt_lines.append("Do not include dialogues among characters.")

    if params["include_discussion_questions"]:
        prompt_lines.append("Conclude with 2-3 simple questions to prompt discussion and reflection among students.")
    else:
        prompt_lines.append("Do not include discussion questions at the end.")

    prompt_lines.append(
        "Ensure the language, examples, names, and cultural details are appropriate for the grade and familiar to children in rural India."
    )

    return "\n".join(prompt_lines)



def gen_story(data):
    prompt = build_story_prompt(data)
    story = generate_story(prompt)
    return story