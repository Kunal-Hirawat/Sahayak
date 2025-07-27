import os
import feedparser
from dotenv import load_dotenv
from google import genai

# Load API key from .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ Missing GEMINI_API_KEY in .env")
    exit()

# Initialize Gemini client
client = genai.Client()

def fetch_google_news(query, max_items=5):
    """Fetch top headlines from Google News RSS."""
    feed_url = (
        f"https://news.google.com/rss/search?"
        f"q={query.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
    )
    feed = feedparser.parse(feed_url)
    return [entry.title for entry in feed.entries[:max_items]]

def create_prompt(location, national_news, local_news):
    """Build a prompt tailored for middle school students (ages 11–14)."""
    return (
        f"You are an engaging and thoughtful educator explaining to middle school students (ages 11–14).\n\n"
        f"Your job is to generate a short, interesting educational summary based on the location and news provided.\n"
        f"Here’s what to include:\n\n"
        f"1. Share 3 interesting and relevant facts about {location}.\n"
        f"   - Include historical, cultural, scientific, or geographical facts.\n"
        f"   - Prioritize lesser-known or unique details.\n"
        f"2. Summarize 2–3 recent national news headlines from India, explaining why they matter.\n"
        f"3. Share 2–3 pieces of local news from {location}, with some brief context if possible.\n"
        f"4. Add 1–2 general knowledge or educational insights that tie into something about the place or the news (e.g. climate, technology, politics, science).\n"
        f"5. Write in a respectful, clear, and informative tone suitable for curious young teens. Don't oversimplify, but explain things clearly.\n"
        f"6. Encourage curiosity by ending with a reflective or thought-provoking question related to what they just learned.\n\n"
        f"Use this format:\n"
        f"📍 About {location}:\n"
        f"- Fact 1\n"
        f"- Fact 2\n"
        f"- Fact 3\n\n"
        f"📰 National News:\n"
        f"- News headline and why it's important\n"
        f"- Another headline with a brief explanation\n\n"
        f"🏙️ Local Highlights:\n"
        f"- Local story 1 with brief background\n"
        f"- Local story 2\n\n"
        f"🌐 Extra Knowledge:\n"
        f"- Related fact or general knowledge 1\n"
        f"- Related fact 2\n\n"
        f"🤔 Think About It:\n"
        f"Ask the students a short question that makes them reflect or want to explore further.\n\n"
        f"---\n"
        f"Here are your reference headlines:\n"
        f"National: {', '.join(national_news)}\n"
        f"Local ({location}): {', '.join(local_news)}\n"
    )


def generate_summary(location):
    """Creates a child-friendly summary using Gemini."""
    national = fetch_google_news("India", max_items=3)
    local = fetch_google_news(location, max_items=2)
    prompt = create_prompt(location, national, local)
    try:
        resp = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return resp.text.strip()
    except Exception as e:
        return f"Error from Gemini: {e}"

def main():
    print("🌍 Welcome to Kids' News & Fun Facts!")
    location = input("🏡 Which place are you curious about today? ").strip()
    if not location:
        print("⚠️ Please enter a valid location.")
        return
    print("\n🧠 Thinking and gathering news...\n")
    result = generate_summary(location)
    print(result)

if __name__ == "__main__":
    main()
