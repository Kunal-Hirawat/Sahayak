# main.py
# --- Imports ---
import os
import re
import uvicorn
import vertexai
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from vertexai.generative_models import GenerativeModel, GenerationConfig, Part
from dotenv import load_dotenv
load_dotenv()

# --- Configuration ---
# To use this application, you need to set up Google Cloud authentication.
# This is typically done by setting the GOOGLE_APPLICATION_CREDENTIALS 
# environment variable to the path of your service account key file.
# For example, in your terminal:
# export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/keyfile.json"

# You also need to specify your Google Cloud project ID and location.
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID") 
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1") # e.g., "us-central1"

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Blackboard-Ready Visual Aid Generator",
    description="An API that uses Gemini on Vertex AI to generate simple, blackboard-friendly SVG diagrams from text prompts.",
    version="1.0.1", # Version updated to reflect changes
)

# --- Pydantic Models for API ---
class PromptRequest(BaseModel):
    """Request model for the diagram generation prompt."""
    prompt: str = Field(..., 
                        description="A simple English text prompt describing the diagram.",
                        example="a simple diagram of the human digestive system")

class SvgResponse(BaseModel):
    """Response model for the generated SVG code."""
    svg: str = Field(..., 
                   description="The generated SVG code as a string.",
                   example="<svg>...</svg>")

# --- Vertex AI Initialization ---
try:
    if not GCP_PROJECT_ID:
        raise ValueError("GCP_PROJECT_ID environment variable not set.")
    vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
except Exception as e:
    print(f"Error initializing Vertex AI: {e}")
    # This will prevent the app from starting if Vertex AI isn't configured.
    # In a real-world scenario, you might handle this more gracefully.
    raise

# --- Gemini Model Configuration ---
# Using gemini-1.5-flash as it is fast and capable for this task.
# You can switch to other models like "gemini-1.0-pro" or "gemini-1.5-pro"
MODEL_NAME = "gemini-2.5-flash" 
generative_model = GenerativeModel(
    MODEL_NAME,
    # This is the core instruction for the model. It's designed to constrain the output
    # to exactly what we need: a minimal, black-and-white, reproducible SVG.
    system_instruction="""
You are an expert SVG diagram generator for teachers. Your task is to create simple, clear, and minimalist line diagrams that a teacher could easily draw on a blackboard.

**Output Requirements:**
1.  **SVG Only:** Your entire output must be ONLY the SVG code. Do not include any other text, explanations, or markdown formatting like ```svg.
2.  **Black and White:** All strokes must be black. Do not use any colors for fill or stroke. The background should be transparent (no fill attribute on the main svg tag).
3.  **Minimalist Design:** Use simple lines and basic shapes. Avoid complex details, shading, or gradients. The goal is easy reproducibility by hand.
4.  **Thick Lines:** Use a default stroke width of 2 or 3 to ensure the lines are clearly visible.
5.  **No Fill:** Elements should not be filled. Use `fill="none"`.
6.  **Standard SVG:** Use standard, widely compatible SVG 1.1.
"""
)

# --- SVG Post-Processing ---
def clean_svg(svg_code: str) -> str:
    """
    Cleans and standardizes the SVG code received from Gemini.

    Args:
        svg_code: The raw SVG string from the model.

    Returns:
        A cleaned SVG string.
    """
    if not isinstance(svg_code, str) or not svg_code.strip().startswith("<svg"):
        raise ValueError("Invalid SVG code received from model. The output did not start with '<svg'.")

    # Remove any markdown formatting
    svg_code = re.sub(r"```svg\n?", "", svg_code)
    svg_code = re.sub(r"```", "", svg_code)

    # Ensure essential SVG attributes for blackboard style
    # Increase stroke width for visibility
    svg_code = re.sub(r'stroke-width="(\d+(\.\d+)?)"', 'stroke-width="3"', svg_code)
    # Force black strokes for all elements
    svg_code = re.sub(r'stroke="[^"]+"', 'stroke="black"', svg_code)
    # Remove any fill colors to keep it a line drawing
    svg_code = re.sub(r'fill="[^"]+"', 'fill="none"', svg_code)
    
    # Add a title for accessibility
    prompt_title = "Blackboard diagram" # A generic title
    if "<title>" not in svg_code:
        svg_code = svg_code.replace(">", f">\n<title>{prompt_title}</title>", 1)

    return svg_code.strip()

# --- API Endpoint ---
@app.post("/generate-diagram", response_model=SvgResponse)
async def generate_diagram(request: PromptRequest):
    """
    Accepts a text prompt and returns blackboard-friendly SVG code.
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    try:
        # Construct the full prompt for the model
        full_prompt = f"Generate an SVG diagram for the following prompt: {request.prompt}"
        
        # Configure generation parameters
        generation_config = GenerationConfig(
            temperature=0.1,  # Lower temperature for more deterministic output
            top_p=0.95,
            max_output_tokens=8192,
        )

        # Send the prompt to Gemini
        response = await generative_model.generate_content_async(
            [full_prompt],
            generation_config=generation_config,
        )

        # --- IMPROVED: More robust response handling ---
        if not response.candidates or not response.candidates[0].content.parts:
            # This can happen if the model's response is blocked (e.g., by safety filters)
            # or if there's another issue with the generation.
            try:
                finish_reason_detail = response.prompt_feedback.block_reason.name
            except Exception:
                finish_reason_detail = "Unknown reason."
            
            error_detail = f"The model did not return any content. Finish Reason: {finish_reason_detail}"
            print(error_detail) # Log for the server admin
            raise HTTPException(status_code=500, detail=error_detail)

        raw_svg = response.text
        
        # Clean and validate the SVG output
        cleaned_svg = clean_svg(raw_svg)

        return JSONResponse(content={"svg": cleaned_svg})

    except ValueError as ve:
        # Handle cases where the SVG from the model is malformed
        error_detail = f"Failed to process or validate the SVG from the model. Error: {ve}"
        print(f"Validation Error: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)
    except Exception as e:
        # Handle other potential errors (e.g., Vertex AI API issues)
        # Provide a more specific error message for easier debugging.
        error_detail = f"An internal error occurred: {type(e).__name__} - {e}"
        print(f"An unexpected error occurred: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)

# --- Health Check Endpoint ---
@app.get("/")
def read_root():
    """A simple health check endpoint."""
    return {"status": "ok", "message": "Welcome to the Blackboard SVG Generator!"}

# --- Main execution block (for local testing) ---
if __name__ == "__main__":
    # This allows you to run the app locally for testing:
    # uvicorn main:app --reload
    # Ensure you have set the GCP_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS
    # environment variables before running.
    print("Starting FastAPI server...")
    print("To test, send a POST request to [http://127.0.0.1:8000/generate-diagram](http://127.0.0.1:8000/generate-diagram)")
    print('Example: curl -X POST "[http://127.0.0.1:8000/generate-diagram](http://127.0.0.1:8000/generate-diagram)" -H "Content-Type: application/json" -d \'{"prompt": "a simple diagram of a flower with labels for petal, stem, and leaf"}\'')
    
    # Note: The host is set to 0.0.0.0 to be accessible within a container.
    uvicorn.run(app, host="0.0.0.0", port=8000)
