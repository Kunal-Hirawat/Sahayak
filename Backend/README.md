# Sahayak Backend API

Flask-based backend API for the Sahayak educational platform, providing AI-powered content generation for teachers.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Gemini API key from Google AI Studio

### Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Run setup script (optional)**
   ```bash
   python setup.py
   ```

4. **Start the server**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /
```
Returns server status and version info.

### Test Endpoint
```
GET /api/test
```
Simple test endpoint to verify API is working.

### ELI5 Generation
```
POST /api/eli5/generate
```

**Request Body:**
```json
{
  "topic": "Photosynthesis",
  "gradeLevel": "4",
  "subject": "Science",
  "localContext": "Mumbai, Maharashtra",
  "complexity": "simple",
  "includeAnalogy": true,
  "includeExample": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "explanation": "Clear explanation of the topic...",
    "metaphor": "Relatable analogy...",
    "example": "Real-world example...",
    "recap": ["Key point 1", "Key point 2", "Key point 3"]
  }
}
```

## 🧠 AI Features

### ELI5 (Explain Like I'm 5)
- **Input Adaptation**: Uses all frontend form inputs (topic, grade, subject, context, complexity)
- **Local Context**: Incorporates Indian cultural context and examples
- **Complexity Levels**: Simple, moderate, detailed explanations
- **Structured Output**: Explanation, metaphor, example, key points
- **Error Handling**: Graceful fallbacks for API failures

### AI Model
- **Provider**: Google Gemini Pro
- **Prompt Engineering**: Optimized for educational content
- **Response Format**: Structured JSON output
- **Fallback Handling**: Default responses when AI fails

## 🛠 Development

### Visual Aid Generation
```
POST /api/visual-aid/generate
```

**Request Body:**
```json
{
  "topic": "Plant Cell",
  "subject": "Science",
  "gradeLevel": "4",
  "visualType": "diagram",
  "complexity": "medium",
  "colorScheme": "colorful",
  "includeLabels": true,
  "includeExplanation": true,
  "size": "medium",
  "style": "simple"
}
```

**Parameters:**
- `topic` (required): The main topic for the visual aid
- `subject` (required): Subject area (Science, Math, etc.)
- `gradeLevel` (required): Target grade level (1, 3, 5, 7)
- `visualType` (required): Type of visual (diagram, chart, map, flowchart, infographic, illustration)
- `complexity` (optional): Level of detail (simple, medium, detailed)
- `colorScheme` (optional): Color preference (colorful, muted, blackboard, monochrome)
- `includeLabels` (optional): Whether to include labels (true/false)
- `includeExplanation` (optional): Whether to include explanatory text (true/false)
- `size` (optional): Size preference (small, medium, large)
- `style` (optional): Visual style (simple, detailed, artistic)

**Response:**
```json
{
  "status": "success",
  "data": {
    "image_data": "base64_encoded_image_string...",
    "metadata": {
      "topic": "Plant Cell",
      "subject": "Science",
      "grade": "4"
    },
    "title": "Plant Cell - Diagram",
    "description": "A diagram showing Plant Cell for Grade 4 students"
  }
}
```

### Worksheet Generation
```
POST /api/worksheet/generate
```

**Request Body:**
```json
{
  "topic": "Fractions",
  "subject": "Math",
  "gradeLevel": ["3", "4"],
  "difficultyLevels": ["medium"],
  "questionTypes": ["multiple-choice"],
  "questionCount": "10",
  "timeLimit": "30",
  "extractedContent": "Optional context from uploaded files"
}
```

**Parameters:**
- `topic` (required): The main topic for the worksheet
- `subject` (required): Subject area (Math, Science, English, etc.)
- `gradeLevel` (required): Array of target grade levels
- `difficultyLevels` (optional): Array of difficulty levels (easy, medium, hard)
- `questionTypes` (optional): Array of question types (multiple-choice, fill-blanks, etc.)
- `questionCount` (optional): Number of questions to generate
- `timeLimit` (optional): Time limit in minutes
- `extractedContent` (optional): Context from uploaded PDF/image files

**Response:**
```json
{
  "status": "success",
  "data": {
    "3": {
      "pdf_data": "base64_encoded_pdf_string...",
      "questions": ["1. What is 1/2 + 1/4?", "2. Solve 3/4 - 1/8"],
      "metadata": {
        "subject": "Math",
        "topic": "Fractions",
        "grade": "3",
        "difficulty": "medium",
        "question_type": "multiple-choice",
        "question_count": 10,
        "time_limit": "30"
      }
    },
    "4": {
      "pdf_data": "base64_encoded_pdf_string...",
      "questions": ["1. Calculate 2/3 × 3/4", "2. What is 5/6 ÷ 1/3?"],
      "metadata": {
        "subject": "Math",
        "topic": "Fractions",
        "grade": "4",
        "difficulty": "medium",
        "question_type": "multiple-choice",
        "question_count": 10,
        "time_limit": "30"
      }
    }
  }
}
```

### Project Structure
```
Backend/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── setup.py              # Setup and testing script
├── .env.example          # Environment template
├── AI/
│   ├── __init__.py       # AI module init
│   ├── eli5.py           # Original AI function
│   ├── eli5_enhanced.py  # Enhanced AI function
│   ├── story_gen_enhanced.py  # Story generation
│   ├── weekly_enhanced.py     # Weekly lesson planner
│   └── image.py          # Visual aid generation
└── README.md             # This file
```

### Testing

**Test AI function directly:**
```bash
cd AI
python eli5_enhanced.py
```

**Test API endpoints:**
```bash
# Health check
curl http://localhost:5000/

# Test endpoint
curl http://localhost:5000/api/test

# ELI5 generation
curl -X POST http://localhost:5000/api/eli5/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Photosynthesis","gradeLevel":"4","subject":"Science","localContext":"Mumbai","complexity":"simple","includeAnalogy":true,"includeExample":true}'
```

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `FLASK_ENV`: development/production (optional)
- `FLASK_DEBUG`: True/False (optional)

### CORS
CORS is enabled for all origins to allow frontend integration during development.

## 🚨 Error Handling

The API includes comprehensive error handling:
- **Input Validation**: Checks required fields
- **AI Failures**: Graceful fallbacks with default responses
- **Network Issues**: Proper HTTP status codes
- **Logging**: Detailed error logs for debugging

## 🔮 Future Features

- Database integration for content storage
- User authentication and authorization
- Additional AI features (worksheets, stories, visual aids)
- Rate limiting and API quotas
- Caching for improved performance
