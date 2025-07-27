from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import traceback
import tempfile
from werkzeug.utils import secure_filename
from functools import wraps

# Load environment variables
load_dotenv()

# Database imports
from database.config import get_database_session_context, initialize_database
from database.content_manager import content_manager
from auth.routes import auth_bp
from auth.auth_manager import auth_manager

# Import AI functions
from AI.eli5_enhanced import explain_to_kid
from AI.story_gen_enhanced import gen_story
from AI.weekly_enhanced import generate_weekly_lesson_plan
from AI.image import get_image_generator
from AI.worksheet import get_worksheet_generator
from AI.game import GameGenerator
import tempfile
import sqlite3
import threading
import time
import json
import requests  # For internet connectivity check
from pydub import AudioSegment
import whisper
from langdetect import detect
import librosa
import numpy as np
from difflib import SequenceMatcher
import re
from collections import Counter
import Levenshtein
import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import soundfile as sf  # For WAV writing

app = Flask(__name__)

# Configure CORS to allow requests from frontend
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

# Register authentication routes
app.register_blueprint(auth_bp)

# Initialize database on startup
try:
    initialize_database()
    print("✅ Database initialized successfully")
except Exception as e:
    print(f"⚠️ Database initialization warning: {e}")

# Authentication middleware
def require_auth(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401

        if not token:
            return jsonify({'error': 'Authentication required'}), 401

        current_user = auth_manager.get_current_user(token)
        if not current_user:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.current_user = current_user
        return f(*args, **kwargs)

    return decorated_function

# Directory for storing queued audio files
QUEUE_DIR = 'queued_audio'
os.makedirs(QUEUE_DIR, exist_ok=True)

# SQLite database for task queue
DB_PATH = 'evaluation_queue.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audio_path TEXT NOT NULL,
            reference_text TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'queued',  -- queued, processing, completed, failed
            result TEXT  -- JSON string of evaluation report, nullable
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class EnhancedReadingEvaluator():

    def __init__(self):
        self.whisper_model = None  # Default to None
        try:
            self.whisper_model = whisper.load_model("large")
            print("Loaded Whisper large model.")
        except Exception as e_large:
            print(f"Failed to load Whisper large: {e_large}")
            try:
                self.whisper_model = whisper.load_model("medium")
                print("Loaded Whisper medium model.")
            except Exception as e_medium:
                print(f"Failed to load Whisper medium: {e_medium}")
                raise RuntimeError("Whisper model failed to load. Cannot proceed.")


    def detect_text_language(self, text):
        try:
            return detect(text)
        except:
            return "unknown"

    def transcribe_audio_with_detection(self, audio_path, prompt_language=None):
        audio, sr = librosa.load(audio_path, sr=16000)
        audio = librosa.util.normalize(audio)
        audio = librosa.effects.preemphasis(audio)
        sf.write(audio_path, audio, sr)

        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)

        n_mels = self.whisper_model.dims.n_mels

        mel = whisper.log_mel_spectrogram(audio, n_mels=n_mels).to(self.whisper_model.device)

        _, probs = self.whisper_model.detect_language(mel)
        detected_lang = max(probs, key=probs.get)

        options = whisper.DecodingOptions(fp16=False, language=prompt_language or detected_lang)
        result = whisper.decode(self.whisper_model, mel, options)

        return result.text, detected_lang

    def transcribe_with_ai4bharat(self, audio_path, language):
        processor, model = self.load_indic_asr_model(language)
        audio, sr = librosa.load(audio_path, sr=16000)
        inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
        with torch.no_grad():
            logits = model(inputs.input_values).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.batch_decode(predicted_ids)[0]
        return transcription

    def load_indic_asr_model(self, language="telugu"):
        if language not in self.models_cache:
            model_name = f"ai4bharat/indicwav2vec_v1_{language}"
            processor = Wav2Vec2Processor.from_pretrained(model_name)
            model = Wav2Vec2ForCTC.from_pretrained(model_name)
            self.models_cache[language] = (processor, model)
        return self.models_cache[language]

    def preprocess_text(self, text):
        text = re.sub(r'[^\w\s]', '', text.lower())
        text = ' '.join(text.split())
        return text

    def calculate_wer(self, reference, hypothesis):
        ref_words = reference.split()
        hyp_words = hypothesis.split()
        distance = Levenshtein.distance(ref_words, hyp_words)
        wer = (distance / len(ref_words) if ref_words else 0) * 100
        return min(100, max(0, wer))

    def calculate_cer(self, reference, hypothesis):
        distance = Levenshtein.distance(reference, hypothesis)
        cer = (distance / len(reference) if reference else 0) * 100
        return min(100, max(0, cer))

    def analyze_errors(self, reference, hypothesis):
        ref_words = reference.split()
        hyp_words = hypothesis.split()
        matcher = SequenceMatcher(None, ref_words, hyp_words)
        errors = {'substitutions': [], 'insertions': [], 'deletions': [], 'correct': []}
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'replace':
                errors['substitutions'].extend([(ref_words[i], hyp_words[j]) for i, j in zip(range(i1, i2), range(j1, j2))])
            elif tag == 'delete':
                errors['deletions'].extend(ref_words[i1:i2])
            elif tag == 'insert':
                errors['insertions'].extend(hyp_words[j1:j2])
            elif tag == 'equal':
                errors['correct'].extend(ref_words[i1:i2])
        return errors

    def calculate_reading_speed(self, audio_path, text):
        audio, sr = librosa.load(audio_path)
        duration_minutes = len(audio) / sr / 60
        word_count = len(text.split())
        return word_count / duration_minutes if duration_minutes > 0 else 0

    def analyze_fluency(self, audio_path):
        audio, sr = librosa.load(audio_path)
        frame_length = int(0.025 * sr)
        hop_length = int(0.010 * sr)
        rms = librosa.feature.rms(y=audio, frame_length=frame_length, hop_length=hop_length)[0]
        silence_threshold = np.mean(rms) * 0.1
        silent_frames = rms < silence_threshold
        pause_count = np.sum(np.diff(silent_frames.astype(int)) == 1)
        total_pause_duration = np.sum(silent_frames) * hop_length / sr
        return {
            'pause_count': pause_count,
            'total_pause_duration': total_pause_duration,
            'average_pause_duration': total_pause_duration / pause_count if pause_count > 0 else 0
        }

    def evaluate_reading(self, audio_path, reference_text):
        text_lang = self.detect_text_language(reference_text)
        transcribed_text, audio_lang = self.transcribe_audio_with_detection(audio_path, prompt_language=text_lang)

        if text_lang != audio_lang:
            raise ValueError(f"Language mismatch: Reference is {text_lang}, audio is {audio_lang}")

        # Fallback to AI4Bharat if WER is high & language is Indic
        ref_clean = self.preprocess_text(reference_text)
        hyp_clean = self.preprocess_text(transcribed_text)
        initial_wer = self.calculate_wer(ref_clean, hyp_clean)

        if initial_wer > 50 and text_lang in ['te', 'hi', 'ta', 'kn', 'ml', 'bn', 'gu', 'mr', 'or', 'pa']:
            transcribed_text = self.transcribe_with_ai4bharat(audio_path, text_lang)
            hyp_clean = self.preprocess_text(transcribed_text)

        wer = self.calculate_wer(ref_clean, hyp_clean)
        cer = self.calculate_cer(ref_clean, hyp_clean)
        reading_speed = self.calculate_reading_speed(audio_path, reference_text)
        fluency_metrics = self.analyze_fluency(audio_path)
        error_analysis = self.analyze_errors(ref_clean, hyp_clean)

        evaluation_report = {
            'transcription': transcribed_text,
            'detected_language': audio_lang,
            'accuracy': {
                'word_error_rate': round(wer, 2),
                'character_error_rate': round(cer, 2),
                'word_accuracy': max(0, round(100 - wer, 2))
            },
            'fluency': {
                'reading_speed_wpm': round(reading_speed, 2),
                'pause_count': fluency_metrics['pause_count'],
                'total_pause_duration': round(fluency_metrics['total_pause_duration'], 2),
                'average_pause_duration': round(fluency_metrics['average_pause_duration'], 2)
            },
            'errors': error_analysis,
            'overall_grade': self.calculate_grade(wer, reading_speed),
            'feedback': self.generate_feedback({
                'accuracy': {'word_accuracy': max(0, round(100 - wer, 2)), 'word_error_rate': round(wer, 2)},
                'fluency': {'reading_speed_wpm': round(reading_speed, 2)},
                'errors': error_analysis
            })
        }

        return evaluation_report

    def calculate_grade(self, wer, reading_speed):
        accuracy_score = max(0, 100 - wer)
        speed_grade = 'A' if reading_speed >= 180 else 'B' if reading_speed >= 120 else 'C' if reading_speed >= 60 else 'D'
        accuracy_grade = 'A' if accuracy_score >= 95 else 'B' if accuracy_score >= 85 else 'C' if accuracy_score >= 75 else 'D'
        return {
            'accuracy_grade': accuracy_grade,
            'speed_grade': speed_grade,
            'overall_score': round((accuracy_score + min(reading_speed / 2, 50)) / 2, 1)
        }

    def generate_feedback(self, report):
        feedback = []
        accuracy = report['accuracy']['word_accuracy']
        speed = report['fluency']['reading_speed_wpm']
        if accuracy >= 95:
            feedback.append("🌟 Excellent accuracy! You read almost perfectly.")
        elif accuracy >= 85:
            feedback.append("👍 Good accuracy! Minor improvements needed.")
        elif accuracy >= 75:
            feedback.append("📚 Fair accuracy. Practice more for better results.")
        else:
            feedback.append("💪 Keep practicing! Focus on word pronunciation.")
        if speed >= 180:
            feedback.append("🚀 Excellent reading speed!")
        elif speed >= 120:
            feedback.append("⚡ Good reading speed.")
        elif speed >= 60:
            feedback.append("🐌 Reading speed needs improvement.")
        else:
            feedback.append("🔄 Practice reading faster while maintaining accuracy.")
        errors = report['errors']
        if errors['substitutions']:
            common_errors = Counter([error[0] for error in errors['substitutions']]).most_common(3)
            feedback.append(f"❌ Common mispronounced words: {', '.join([word for word, count in common_errors])}")
        if errors['deletions']:
            feedback.append(f"⚠ You skipped {len(errors['deletions'])} words. Read more carefully.")
        if errors['insertions']:
            feedback.append(f"➕ You added {len(errors['insertions'])} extra words. Stick to the text.")
        return feedback

evaluator = EnhancedReadingEvaluator()

def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(i) for i in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj

def is_internet_available():
    try:
        requests.get("https://www.google.com", timeout=5)
        return True
    except requests.RequestException:
        return False

def process_queue():
    """Background worker to process queued tasks one at a time (FIFO) when internet is available."""
    while True:
        if is_internet_available():
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Fetch oldest queued task (FIFO by id)
            cursor.execute(
                "SELECT id, audio_path, reference_text FROM tasks WHERE status = 'queued' ORDER BY id ASC LIMIT 1"
            )
            task = cursor.fetchone()

            if task:
                task_id, audio_path, reference_text = task
                try:
                    cursor.execute("UPDATE tasks SET status = 'processing' WHERE id = ?", (task_id,))
                    conn.commit()

                    # Convert audio to WAV format for processing
                    mp3_path = audio_path.replace(audio_path.split('.')[-1], "mp3")

                    try:
                        if audio_path.endswith('.mp3'):
                            audio_segment = AudioSegment.from_mp3(audio_path)
                        elif audio_path.endswith('.webm'):
                            # Handle WebM files
                            audio_segment = AudioSegment.from_file(audio_path, format="webm")
                        elif audio_path.endswith('.ogg'):
                            audio_segment = AudioSegment.from_ogg(audio_path)
                        elif audio_path.endswith('.wav'):
                            audio_segment = AudioSegment.from_wav(audio_path)
                        else:
                            # Try to auto-detect format
                            audio_segment = AudioSegment.from_file(audio_path)

                        # Export as WAV for consistent processing
                        audio_segment.export(mp3_path, format="mp3")
                        print(f"✅ Audio converted: {audio_path} -> {mp3_path}")

                    except Exception as conversion_error:
                        print(f"❌ Audio conversion failed: {conversion_error}")
                        # If conversion fails, try to use the original file
                        mp3_path = audio_path

                    # Evaluate reading
                    report = evaluator.evaluate_reading(mp3_path, reference_text)
                    serializable_report = convert_numpy_types(report)

                    # Cleanup files after processing
                    if mp3_path != audio_path and os.path.exists(mp3_path):
                        os.unlink(mp3_path)
                    if os.path.exists(audio_path):
                        os.unlink(audio_path)

                    cursor.execute(
                        "UPDATE tasks SET status = 'completed', result = ? WHERE id = ?",
                        (json.dumps(serializable_report), task_id),
                    )
                    print(f"Processed task {task_id} successfully.")
                except Exception as e:
                    print(f"Failed processing task {task_id}: {e}")
                    cursor.execute("UPDATE tasks SET status = 'failed' WHERE id = ?", (task_id,))
                finally:
                    conn.commit()
            conn.close()
        time.sleep(30)  # Wait 30 seconds before checking queue again

threading.Thread(target=process_queue, daemon=True).start()

@app.route('/api/evaluate', methods=['POST'])
@require_auth
def evaluate_reading():
    try:
        user_id = str(request.current_user.id)

        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        audio = request.files['audio']
        reference_text = request.form.get('reference_text')
        if not reference_text:
            return jsonify({'error': 'No reference_text provided'}), 400

        # Get additional form data
        student_name = request.form.get('student_name', 'Unknown Student')
        grade_level = request.form.get('grade_level', '1')
        text_title = request.form.get('text_title', 'Reading Assessment')
        audio_duration = request.form.get('audio_duration', '0')

        print(f"🎤 DEBUG: Processing fluency assessment for user {user_id}, student: {student_name}")

        # Save audio to persistent queue directory with a unique name
        # Determine file extension based on content type or filename
        original_filename = audio.filename or 'audio'
        file_extension = 'webm'  # Default to webm since that's what we're sending

        if original_filename.endswith('.mp3'):
            file_extension = 'mp3'
        elif original_filename.endswith('.wav'):
            file_extension = 'wav'
        elif original_filename.endswith('.webm'):
            file_extension = 'webm'
        elif original_filename.endswith('.ogg'):
            file_extension = 'ogg'

        filename = f"audio_{int(time.time()*1000)}.{file_extension}"
        audio_path = os.path.join(QUEUE_DIR, filename)
        audio.save(audio_path)

        print(f"🎤 DEBUG: Audio saved as {filename} (detected format: {file_extension})")
        print(f"🎤 DEBUG: File size: {os.path.getsize(audio_path)} bytes")

        # Save assessment to PostgreSQL database
        try:
            success, message, assessment_data = content_manager.save_fluency_assessment(
                user_id=user_id,
                assessment_data={
                    'student_name': student_name,
                    'grade_level': grade_level,
                    'assessment_text': reference_text,
                    'text_title': text_title,
                    'text_word_count': len(reference_text.split()),
                    'audio_file_url': audio_path,
                    'audio_duration_seconds': float(audio_duration) if audio_duration else None,
                    'audio_file_size_bytes': os.path.getsize(audio_path),
                    'is_custom_text': request.form.get('assessment_type') == 'custom'
                }
            )

            if success:
                assessment_id = assessment_data['id']
                print(f"✅ DEBUG: Assessment saved to database: {assessment_id}")
            else:
                print(f"⚠️ DEBUG: Failed to save assessment: {message}")
                # Continue with SQLite fallback
                assessment_id = None

        except Exception as db_error:
            print(f"⚠️ DEBUG: Database save error: {db_error}")
            assessment_id = None

        # Insert queued task into SQLite (for processing queue)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO tasks (audio_path, reference_text, status, assessment_id) VALUES (?, ?, 'queued', ?)",
            (audio_path, reference_text, assessment_id)
        )
        task_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            'message': 'Assessment saved and task queued',
            'task_id': task_id,
            'assessment_id': assessment_id
        }), 202
    except Exception as e:
        return jsonify({'error': f"Failed to queue task: {str(e)}"}), 500

@app.route('/api/results/<int:task_id>', methods=['GET'])
def get_results(task_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT status, result FROM tasks WHERE id = ?",
            (task_id,)
        )
        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({'error': 'Task not found'}), 404

        status, result = row
        if status == 'completed':
            return jsonify(json.loads(result))
        elif status == 'failed':
            return jsonify({'error': 'Processing failed'}), 500
        else:  # queued or processing
            return jsonify({'message': f'Task is {status}'}), 202
    except Exception as e:
        return jsonify({'error': f"Failed to get results: {str(e)}"}), 500


# Initialize AI generators
game_generator = None

def get_game_generator():
    """Get or create game generator instance"""
    global game_generator
    if game_generator is None:
        game_generator = GameGenerator()
    return game_generator

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "Sahayak Backend API is running!",
        "version": "1.0.0"
    })

@app.route('/api/eli5/generate', methods=['POST'])
@require_auth
def generate_eli5():
    """Generate ELI5 explanation based on frontend inputs"""
    try:
        # Get data from frontend
        data = request.get_json()
        user_id = str(request.current_user.id)

        # Validate required fields
        required_fields = ['topic', 'gradeLevel', 'subject']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Extract form data
        topic = data.get('topic', '').strip()
        grade_level = data.get('gradeLevel', '3')
        subject = data.get('subject', 'General')
        local_context = data.get('localContext', 'India')
        complexity = data.get('complexity', 'simple')
        include_analogy = data.get('includeAnalogy', True)
        include_example = data.get('includeExample', True)

        # Validate topic
        if not topic:
            return jsonify({
                "status": "error",
                "message": "Topic cannot be empty"
            }), 400

        print(f"🔧 DEBUG: Generating ELI5 for user {user_id}, topic: {topic}")

        # Call AI function
        result = explain_to_kid(
            topic=topic,
            grade_level=grade_level,
            subject=subject,
            local_context=local_context,
            complexity=complexity,
            include_analogy=include_analogy,
            include_example=include_example,
            language=data.get('language', 'english')
        )

        # Save to database
        saved = False
        try:
            success, message, saved_data = content_manager.save_eli5_explanation(
                user_id=user_id,
                explanation_data={
                    'topic': topic,
                    'explanation': result.get('explanation', ''),
                    'grade_level': grade_level,
                    'subject': subject,
                    'complexity_level': complexity,
                    'language': data.get('language', 'english'),
                    'word_count': len(result.get('explanation', '').split()),
                    'reading_time_minutes': max(1, len(result.get('explanation', '').split()) // 200)
                }
            )

            if success:
                print(f"✅ DEBUG: ELI5 saved to database: {saved_data['id']}")
                saved = True
            else:
                print(f"⚠️ DEBUG: Failed to save ELI5: {message}")

        except Exception as db_error:
            print(f"⚠️ DEBUG: Database save error: {db_error}")

        # Return successful response
        return jsonify({
            "status": "success",
            "data": result,
            "saved": saved
        })

    except Exception as e:
        # Log error for debugging
        print(f"Error in generate_eli5: {str(e)}")
        print(traceback.format_exc())

        return jsonify({
            "status": "error",
            "message": "Failed to generate explanation. Please try again.",
            "error": str(e) if app.debug else None
        }), 500

@app.route("/api/generate_story", methods=["POST"])
@require_auth
def generate_story_endpoint():
    """Generate story based on frontend inputs"""
    try:
        # Get data from frontend
        data = request.get_json()
        user_id = str(request.current_user.id)

        # Validate required fields (frontend field names)
        required_fields = ['topic', 'gradeLevel', 'storyLength', 'localContext', 'storyType', 'characters', 'setting']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Map frontend fields to backend expected format
        backend_data = {
            "story_topic": data.get('topic', '').strip(),
            "grade_level": f"Grade {data.get('gradeLevel', '3')}",
            "story_length": data.get('storyLength', 'medium').title(),  # medium -> Medium
            "local_context": data.get('localContext', 'India'),
            "story_type": data.get('storyType', 'moral'),
            "main_characters": data.get('characters', 'children'),
            "story_setting": data.get('setting', 'village'),
            "include_dialogue": data.get('includeDialogue', True),
            "include_discussion_questions": data.get('includeQuestions', True),
            "moral_lesson": data.get('moralLesson', ''),
            "language": data.get('language', 'english')
        }

        # Validate topic
        if not backend_data['story_topic']:
            return jsonify({
                "status": "error",
                "message": "Topic cannot be empty"
            }), 400

        print(f"🔧 DEBUG: Generating story for user {user_id}, topic: {backend_data['story_topic']}")

        # Call AI function
        result = gen_story(backend_data)

        # Save to database
        saved = False
        try:
            # Extract characters from the result or use input
            characters = []
            if isinstance(data.get('characters'), list):
                characters = data.get('characters')
            elif isinstance(data.get('characters'), str):
                characters = [data.get('characters')]

            success, message, saved_data = content_manager.save_story(
                user_id=user_id,
                story_data={
                    'title': result.get('title', f"Story about {backend_data['story_topic']}"),
                    'theme': backend_data['story_topic'],
                    'characters': characters,
                    'grade_level': data.get('gradeLevel', '3'),
                    'subject': 'Language Arts',
                    'moral_lesson': backend_data.get('moral_lesson', ''),
                    'story_content': result.get('story', ''),
                    'language': data.get('language', 'english'),
                    'word_count': len(result.get('story', '').split()),
                    'estimated_reading_time': max(1, len(result.get('story', '').split()) // 150)
                }
            )

            if success:
                print(f"✅ DEBUG: Story saved to database: {saved_data['id']}")
                saved = True
            else:
                print(f"⚠️ DEBUG: Failed to save story: {message}")

        except Exception as db_error:
            print(f"⚠️ DEBUG: Database save error: {db_error}")

        # Return successful response
        return jsonify({
            "status": "success",
            "data": result,
            "saved": saved
        })

    except Exception as e:
        # Log error for debugging
        print(f"Error in generate_story_endpoint: {str(e)}")
        print(traceback.format_exc())

        return jsonify({
            "status": "error",
            "message": "Failed to generate story. Please try again.",
            "error": str(e) if app.debug else None
        }), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify API is working"""
    return jsonify({
        "status": "success",
        "message": "Test endpoint working!",
        "timestamp": str(os.environ.get('TIMESTAMP', 'Not set'))
    })

@app.route('/api/generate_weekly_plan', methods=['POST'])
@require_auth
def generate_weekly_plan_endpoint():
    """Generate weekly lesson plan based on form data and optional PDF upload"""
    try:
        user_id = str(request.current_user.id)

        # Handle file upload
        pdf_file_path = None
        if 'syllabusFile' in request.files:
            pdf_file = request.files['syllabusFile']

            if pdf_file and pdf_file.filename:
                # Validate file type
                if not pdf_file.filename.lower().endswith('.pdf'):
                    return jsonify({
                        "status": "error",
                        "message": "Only PDF files are allowed"
                    }), 400

                # Save file temporarily
                filename = secure_filename(pdf_file.filename)
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                    pdf_file.save(tmp_file.name)
                    pdf_file_path = tmp_file.name

        # Get form data
        form_data = {}
        for key in request.form:
            form_data[key] = request.form[key]

        # Validate required fields
        required_fields = ['subject', 'gradeLevel', 'topic']
        for field in required_fields:
            if field not in form_data or not form_data[field].strip():
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Convert string booleans to actual booleans
        boolean_fields = ['includeAssessment', 'includeHomework']
        for field in boolean_fields:
            if field in form_data:
                form_data[field] = form_data[field].lower() in ['true', '1', 'yes']

        print(f"🔧 DEBUG: Generating lesson plan for user {user_id}, subject: {form_data['subject']}")

        # Generate lesson plan
        result = generate_weekly_lesson_plan(form_data, pdf_file_path)

        # Save to database
        saved = False
        try:
            # Extract learning objectives and materials from result
            learning_objectives = []
            materials_needed = []
            assessment_methods = []
            homework_assignments = []

            # Try to parse these from the result if available
            if isinstance(result, dict):
                learning_objectives = result.get('learning_objectives', [])
                materials_needed = result.get('materials_needed', [])
                assessment_methods = result.get('assessment_methods', [])
                homework_assignments = result.get('homework_assignments', [])

            success, message, saved_data = content_manager.save_lesson_plan(
                user_id=user_id,
                lesson_plan_data={
                    'title': f"Weekly Plan: {form_data['topic']}",
                    'subject': form_data['subject'],
                    'grade_level': form_data['gradeLevel'],
                    'week_number': int(form_data.get('weekNumber', 1)),
                    'academic_year': form_data.get('academicYear', '2024-25'),
                    'curriculum_standard': form_data.get('curriculumStandard', 'NCERT'),
                    'learning_objectives': learning_objectives,
                    'plan_content': str(result),  # Store the full result as text
                    'materials_needed': materials_needed,
                    'assessment_methods': assessment_methods,
                    'homework_assignments': homework_assignments,
                    'duration_minutes': int(form_data.get('duration', 45))
                }
            )

            if success:
                print(f"✅ DEBUG: Lesson plan saved to database: {saved_data['id']}")
                saved = True
            else:
                print(f"⚠️ DEBUG: Failed to save lesson plan: {message}")

        except Exception as db_error:
            print(f"⚠️ DEBUG: Database save error: {db_error}")

        # Clean up temporary file
        if pdf_file_path and os.path.exists(pdf_file_path):
            os.unlink(pdf_file_path)

        # Return successful response
        return jsonify({
            "status": "success",
            "data": result,
            "saved": saved
        })

    except Exception as e:
        # Clean up temporary file in case of error
        if 'pdf_file_path' in locals() and pdf_file_path and os.path.exists(pdf_file_path):
            os.unlink(pdf_file_path)

        # Log error for debugging
        print(f"Error in generate_weekly_plan_endpoint: {str(e)}")
        print(traceback.format_exc())

        return jsonify({
            "status": "error",
            "message": "Failed to generate weekly lesson plan. Please try again.",
            "error": str(e) if app.debug else None
        }), 500

@app.route('/api/visual-aid/generate', methods=['POST'])
@require_auth
def generate_visual_aid():
    """Generate visual aid based on frontend inputs"""
    try:
        # Get data from frontend
        data = request.get_json()
        user_id = str(request.current_user.id)

        # Validate required fields
        required_fields = ['topic', 'subject', 'gradeLevel', 'visualType']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Extract form data
        topic = data.get('topic', '').strip()
        subject = data.get('subject', 'Science')
        grade_level = data.get('gradeLevel', '3')
        visual_type = data.get('visualType', 'diagram')
        complexity = data.get('complexity', 'medium')
        color_scheme = data.get('colorScheme', 'colorful')
        include_labels = data.get('includeLabels', True)
        include_explanation = data.get('includeExplanation', True)
        size = data.get('size', 'medium')
        style = data.get('style', 'simple')

        # Validate topic
        if not topic:
            return jsonify({
                "status": "error",
                "message": "Topic cannot be empty"
            }), 400

        print(f"🔧 DEBUG: Generating visual aid for user {user_id}, topic: {topic}")

        # Map frontend visualType to backend diagram_type
        visual_type_mapping = {
            'diagram': 'Diagram',
            'flowchart': 'Flowchart',
            'concept-map': 'Conceptual Map',
            'timeline': 'Timeline',
            'chart': 'Chart',
            'infographic': 'Infographic',
            'map': 'Map',
            'illustration': 'Illustration'
        }
        diagram_type = visual_type_mapping.get(visual_type, 'Diagram')

        # Get image generator instance
        generator = get_image_generator()

        # Call AI function with all parameters
        result = generator.generate_educational_diagram(
            topic=topic,
            subject=subject,
            grade=grade_level,
            diagram_type=diagram_type,
            language="English",
            complexity=complexity,
            color_scheme=color_scheme,
            include_labels=include_labels,
            include_explanation=include_explanation,
            size=size,
            style=style
        )

        if result['success']:
            # Save to database
            saved = False
            try:
                # Create image prompt from parameters
                image_prompt = f"Educational {diagram_type.lower()} about {topic} for Grade {grade_level} students, {complexity} complexity, {color_scheme} colors, {style} style"

                success, message, saved_data = content_manager.save_visual_aid(
                    user_id=user_id,
                    visual_aid_data={
                        'title': f"{topic} - {diagram_type}",
                        'description': f"A {diagram_type.lower()} showing {topic} for Grade {grade_level} students",
                        'subject': subject,
                        'topic': topic,
                        'grade_level': grade_level,
                        'complexity': complexity,
                        'color_scheme': color_scheme,
                        'style': style,
                        'size': size,
                        'include_labels': include_labels,
                        'include_explanation': include_explanation,
                        'image_url': result.get('image_url', ''),  # If available
                        'image_prompt': image_prompt,
                        'generation_metadata': result.get('metadata', {})
                    }
                )

                if success:
                    print(f"✅ DEBUG: Visual aid saved to database: {saved_data['id']}")
                    saved = True
                else:
                    print(f"⚠️ DEBUG: Failed to save visual aid: {message}")

            except Exception as db_error:
                print(f"⚠️ DEBUG: Database save error: {db_error}")

            # Return successful response
            return jsonify({
                "status": "success",
                "data": {
                    "image_data": result['image_data'],
                    "metadata": result['metadata'],
                    "title": f"{topic} - {diagram_type}",
                    "description": f"A {diagram_type.lower()} showing {topic} for Grade {grade_level} students"
                },
                "saved": saved
            })
        else:
            # Handle AI generation failure
            return jsonify({
                "status": "error",
                "message": "Failed to generate visual aid. Please try again.",
                "error": result.get('error', 'Unknown error')
            }), 500

    except Exception as e:
        # Log error for debugging
        print(f"Error in generate_visual_aid: {str(e)}")
        print(traceback.format_exc())

        return jsonify({
            "status": "error",
            "message": "Failed to generate visual aid. Please try again.",
            "error": str(e) if app.debug else None
        }), 500

@app.route('/api/worksheet/generate', methods=['POST'])
def generate_worksheet():
    """Generate worksheet based on frontend inputs"""
    print("🔧 DEBUG: Received worksheet generation request")

    try:
        # Get data from frontend
        data = request.get_json()
        print(f"🔧 DEBUG: Request data: {data}")

        # Validate required fields
        required_fields = ['topic', 'subject', 'gradeLevel', 'questionCount']
        print(f"🔧 DEBUG: Validating required fields: {required_fields}")

        for field in required_fields:
            if field not in data:
                print(f"❌ DEBUG: Missing required field: {field}")
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Validate topic
        topic = data.get('topic', '').strip()
        print(f"🔧 DEBUG: Topic validation - '{topic}'")
        if not topic:
            print("❌ DEBUG: Topic is empty")
            return jsonify({
                "status": "error",
                "message": "Topic cannot be empty"
            }), 400

        # Validate grade levels
        grade_levels = data.get('gradeLevel', [])
        print(f"🔧 DEBUG: Grade levels validation - {grade_levels}")
        if not grade_levels or len(grade_levels) == 0:
            print("❌ DEBUG: No grade levels selected")
            return jsonify({
                "status": "error",
                "message": "At least one grade level must be selected"
            }), 400

        # Get worksheet generator instance
        print("🔧 DEBUG: Getting worksheet generator instance...")
        generator = get_worksheet_generator()
        print("✅ DEBUG: Worksheet generator instance obtained")

        # Call AI function
        print("🔧 DEBUG: Calling generate_worksheets...")
        result = generator.generate_worksheets(data)
        print(f"🔧 DEBUG: AI function result: {result.get('success', False)}")

        if result['success']:
            print("✅ DEBUG: Worksheet generation successful")
            worksheets_count = len(result['worksheets'])
            print(f"🔧 DEBUG: Generated {worksheets_count} worksheets")

            # Return successful response
            response_data = {
                "status": "success",
                "data": result['worksheets']
            }
            print(f"🔧 DEBUG: Sending response with {len(str(response_data))} characters")
            return jsonify(response_data)
        else:
            print(f"❌ DEBUG: Worksheet generation failed: {result.get('error', 'Unknown error')}")
            # Handle AI generation failure
            return jsonify({
                "status": "error",
                "message": "Failed to generate worksheet. Please try again.",
                "error": result.get('error', 'Unknown error')
            }), 500

    except Exception as e:
        # Log error for debugging
        print(f"❌ DEBUG: Exception in generate_worksheet endpoint: {str(e)}")
        print(f"❌ DEBUG: Traceback: {traceback.format_exc()}")

        return jsonify({
            "status": "error",
            "message": "Failed to generate worksheet. Please try again.",
            "error": str(e) if app.debug else None
        }), 500

@app.route('/api/worksheet/pdf/<grade>', methods=['GET'])
def serve_pdf(grade):
    """Serve PDF directly to bypass client-side restrictions"""
    try:
        # This is a temporary solution - in production, you'd store PDFs and retrieve by ID
        # For now, we'll return a simple response
        return jsonify({
            "status": "info",
            "message": "PDF serving endpoint ready. Implement PDF storage for production use."
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to serve PDF",
            "error": str(e)
        }), 500

@app.route('/api/game/generate', methods=['POST'])
@require_auth
def generate_game():
    """Generate educational game based on frontend inputs"""
    print("🎮 DEBUG: Received game generation request")

    try:
        # Get data from frontend
        data = request.get_json()
        user_id = str(request.current_user.id)
        print(f"🎮 DEBUG: Request data for user {user_id}: {data}")

        # Validate required fields
        required_fields = ['topic', 'subject', 'gradeLevel']
        print(f"🎮 DEBUG: Validating required fields: {required_fields}")

        for field in required_fields:
            if field not in data:
                print(f"❌ DEBUG: Missing required field: {field}")
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400

        # Validate topic
        topic = data.get('topic', '').strip()
        print(f"🎮 DEBUG: Topic validation - '{topic}'")
        if not topic:
            print("❌ DEBUG: Topic is empty")
            return jsonify({
                "status": "error",
                "message": "Topic cannot be empty"
            }), 400

        # Get game generator instance
        print("🎮 DEBUG: Getting game generator instance...")
        generator = get_game_generator()
        print("✅ DEBUG: Game generator instance obtained")

        # Call AI function
        print("🎮 DEBUG: Calling generate_educational_game...")
        result = generator.generate_educational_game(data)
        print(f"🎮 DEBUG: AI function result: {result.get('success', False)}")

        if result['success']:
            print("✅ DEBUG: Game generation successful")

            # Save to database
            saved = False
            try:
                success, message, saved_data = content_manager.save_educational_game(
                    user_id=user_id,
                    game_data={
                        'title': f"{topic} Game",
                        'description': f"Educational game about {topic} for Grade {data.get('gradeLevel')} students",
                        'subject': data.get('subject', 'General'),
                        'topic': topic,
                        'grade_level': data.get('gradeLevel', '3'),
                        'theme': data.get('theme', 'educational'),
                        'difficulty': data.get('difficulty', 'medium'),
                        'duration': data.get('duration', 'medium'),
                        'game_type': data.get('gameType', 'quiz'),
                        'html_code': result['game'],  # Store the HTML game code
                        'design_document': f"Game generated for topic: {topic}"
                    }
                )

                if success:
                    print(f"✅ DEBUG: Game saved to database: {saved_data['id']}")
                    saved = True
                else:
                    print(f"⚠️ DEBUG: Failed to save game: {message}")

            except Exception as db_error:
                print(f"⚠️ DEBUG: Database save error: {db_error}")

            # Return successful response
            response_data = {
                "status": "success",
                "data": result['game'],
                "saved": saved
            }
            print(f"🎮 DEBUG: Sending response with game data")
            return jsonify(response_data)
        else:
            print(f"❌ DEBUG: Game generation failed: {result.get('error', 'Unknown error')}")
            # Handle AI generation failure
            return jsonify({
                "status": "error",
                "message": "Failed to generate game. Please try again.",
                "error": result.get('error', 'Unknown error')
            }), 500

    except Exception as e:
        # Log error for debugging
        print(f"❌ DEBUG: Exception in generate_game endpoint: {str(e)}")
        print(f"❌ DEBUG: Traceback: {traceback.format_exc()}")

        return jsonify({
            "status": "error",
            "message": "Failed to generate game. Please try again.",
            "error": str(e) if app.debug else None
        }), 500

if __name__ == '__main__':
    # Check for required environment variables
    if not os.getenv('GEMINI_API_KEY'):
        print("Warning: GEMINI_API_KEY not found in environment variables")

    # Run the Flask app
# Content retrieval routes
@app.route('/api/content/<content_type>', methods=['GET'])
@require_auth
def get_user_content(content_type):
    """Get user's saved content by type"""
    try:
        user_id = str(request.current_user.id)
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)

        content_methods = {
            'eli5': content_manager.get_eli5_explanations,
            'stories': content_manager.get_stories,
            'visual-aids': content_manager.get_visual_aids,
            'games': content_manager.get_educational_games,
            'lesson-plans': content_manager.get_lesson_plans,
            'fluency-assessments': content_manager.get_fluency_assessments
        }

        if content_type not in content_methods:
            return jsonify({'error': 'Invalid content type'}), 400

        content = content_methods[content_type](user_id, limit, offset)

        return jsonify({
            'success': True,
            'content': content,
            'count': len(content),
            'content_type': content_type
        })

    except Exception as e:
        print(f"Error getting user content: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
@require_auth
def get_dashboard_stats():
    """Get dashboard statistics for user"""
    try:
        user_id = str(request.current_user.id)

        stats = content_manager.get_user_dashboard_stats(user_id)

        return jsonify({
            'success': True,
            'stats': stats
        })

    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )