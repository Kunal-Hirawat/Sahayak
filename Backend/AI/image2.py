import vertexai
from vertexai.preview.vision_models import ImageGenerationModel, Image
import time

# --- Configuration ---
GCP_PROJECT_ID = "agentic-ai-467108"  # 👈 Replace with your Project ID
GCP_REGION = "asia-south1"      # 👈 Replace with your GCP Region (e.g., "us-central1")
PROMPT = "A futuristic sports car racing through a neon-lit city at night, rain-slicked streets, cinematic lighting"

# --- Initialize Vertex AI ---
vertexai.init(project=GCP_PROJECT_ID, location=GCP_REGION)

print("✅ Vertex AI Initialized.")
print(f"🤖 Using Model: imagegeneration@006")
print(f"🎨 Generating image with prompt: '{PROMPT}'")

# --- Load the model ---
# This uses a specific identifier for the image generation model
model = ImageGenerationModel.from_pretrained("imagen-4.0-ultra-generate-preview-06-06")

# --- Generate the image ---
# The API can generate multiple images at once (e.g., number_of_images=2)
images = model.generate_images(
    prompt=PROMPT,
    number_of_images=1,
    # Optional parameters:
    # negative_prompt="text, watermark, blurry",
    # aspect_ratio="1:1",
)

print("Image generation successful. Saving file...")

# --- Save the generated image ---
# The API returns a list of Image objects. We'll save the first one.
if images:
    # Create a unique filename with a timestamp
    timestamp = int(time.time())
    file_name = f"generated_image_{timestamp}.png"
    
    # The image data is in the _image_bytes attribute
    images[0].save(location=file_name, include_generation_parameters=True)
    print(f"✅ Image saved as '{file_name}'")
else:
    print("❌ No image was generated.")