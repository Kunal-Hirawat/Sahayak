#!/usr/bin/env python3
"""
Minimal server test to check if Flask can start
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'], 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "Sahayak Backend API is running!",
        "version": "1.0.0"
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        "status": "success",
        "message": "Test endpoint working!",
        "database_configured": True
    })

if __name__ == '__main__':
    print("🚀 Starting minimal Sahayak server...")
    
    # Check for required environment variables
    if not os.getenv('GEMINI_API_KEY'):
        print("Warning: GEMINI_API_KEY not found in environment variables")
    
    print("✅ Environment variables loaded")
    print("✅ Flask app configured")
    print("🌐 Starting server on http://localhost:5001")

    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
