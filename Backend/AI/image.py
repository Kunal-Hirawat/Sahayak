import base64
import io
from typing import Dict, Any
from vertexai.preview.vision_models import ImageGenerationModel
import vertexai

class ImageGenerator:
    def __init__(self):
        # Initialize Vertex AI when the class is instantiated
        try:
            vertexai.init(project="agentic-ai-467108", location="us-central1")
            self.generation_model = ImageGenerationModel.from_pretrained("imagen-4.0-ultra-generate-preview-06-06")
            print("✅ ImageGenerator initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize ImageGenerator: {e}")
            raise

    def generate_educational_diagram(
        self,
        topic: str,
        subject: str,
        grade: str,
        diagram_type: str = "Conceptual Map",
        language: str = "English",
        complexity: str = "medium",
        color_scheme: str = "colorful",
        include_labels: bool = True,
        include_explanation: bool = True,
        size: str = "medium",
        style: str = "simple",
        additional_instructions: str = ""
    ) -> Dict[str, Any]:
        """
        Generate an educational diagram based on the provided parameters.

        Args:
            topic: The main topic for the diagram
            subject: The subject area (Science, Math, etc.)
            grade: Target grade level
            diagram_type: Type of diagram to create
            language: Language for text in the diagram
            complexity: Level of detail (simple, medium, detailed)
            color_scheme: Color scheme preference (colorful, muted, blackboard, monochrome)
            include_labels: Whether to include labels and annotations
            include_explanation: Whether to include explanation text
            size: Size preference (small, medium, large)
            style: Visual style preference (simple, detailed, artistic)
            additional_instructions: Any additional specific instructions

        Returns:
            Dictionary containing the generated image data and metadata
        """
        try:
            # Build comprehensive prompt based on all parameters
            prompt = self._build_comprehensive_prompt(
                topic, subject, grade, diagram_type, language,
                complexity, color_scheme, include_labels,
                include_explanation, size, style, additional_instructions
            )

            # Generate the image
            images = self.generation_model.generate_images(
                prompt=prompt,
                number_of_images=1,
                aspect_ratio="1:1",
                negative_prompt="",
                person_generation="allow_all",
                safety_filter_level="block_few",
                add_watermark=True,
            )

            # Convert image to base64 for API response
            image_data = self._image_to_base64(images[0])

            return {
                "success": True,
                "image_data": image_data,
                "metadata": {
                    "topic": topic,
                    "subject": subject,
                    "grade": grade,
                    "diagram_type": diagram_type,
                    "language": language
                }
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "metadata": None
            }

    def _image_to_base64(self, image) -> str:
        """Convert generated image to base64 string for API response."""
        try:
            # Get PIL image from the generated image
            pil_image = image._pil_image

            # Convert to RGB if needed
            if pil_image.mode != "RGB":
                pil_image = pil_image.convert("RGB")

            # Convert to base64
            buffer = io.BytesIO()
            pil_image.save(buffer, format="PNG")
            image_base64 = base64.b64encode(buffer.getvalue()).decode()

            return image_base64

        except Exception as e:
            raise Exception(f"Error converting image to base64: {str(e)}")

    def _build_comprehensive_prompt(self, topic, subject, grade, diagram_type, language,
                                  complexity, color_scheme, include_labels, include_explanation,
                                  size, style, additional_instructions):
        """Build a comprehensive prompt based on all user parameters."""

        # Age-appropriate descriptions based on grade
        age_descriptions = {
            '1': 'very young children (ages 6-8)',
            '3': 'elementary students (ages 8-10)',
            '5': 'middle elementary students (ages 10-12)',
            '7': 'middle school students (ages 12-14)'
        }

        # Complexity level descriptions
        complexity_descriptions = {
            'simple': 'Keep it very basic with minimal details. Focus on main concepts only.',
            'medium': 'Include moderate detail with key components clearly shown.',
            'detailed': 'Provide comprehensive detail with all important elements and relationships.'
        }

        # Color scheme instructions
        color_instructions = {
            'colorful': 'Use bright, engaging colors that appeal to students. Make it vibrant and eye-catching.',
            'muted': 'Use softer, muted colors that are easy on the eyes and not distracting.',
            'blackboard': 'Create a blackboard-style design with white/yellow text and drawings on a dark background.',
            'monochrome': 'Use only black and white with different shades and line weights for emphasis.'
        }

        # Visual type specific instructions
        visual_type_instructions = {
            'diagram': 'Create a clear, labeled diagram showing the structure and components',
            'chart': 'Design a chart or graph that visualizes data or relationships clearly',
            'map': 'Create a map (geographical or conceptual) with clear boundaries and labels',
            'flowchart': 'Design a step-by-step flowchart with arrows showing the process flow',
            'infographic': 'Create an information-rich visual that combines text, icons, and graphics',
            'illustration': 'Create a detailed illustration that clearly shows the concept visually'
        }

        # Size-based layout instructions
        size_instructions = {
            'small': 'Compact design suitable for handouts or small displays',
            'medium': 'Standard size appropriate for classroom projection or worksheets',
            'large': 'Large format suitable for wall displays or detailed examination'
        }

        # Build the comprehensive prompt
        prompt = f"""Create an educational {diagram_type.lower()} about "{topic}" for {subject}.

TARGET AUDIENCE: {age_descriptions.get(grade, f'Grade {grade} students')}

VISUAL TYPE: {visual_type_instructions.get(diagram_type.lower(), 'Create a clear visual representation')}

COMPLEXITY LEVEL: {complexity_descriptions[complexity]}

COLOR SCHEME: {color_instructions[color_scheme]}

SIZE & LAYOUT: {size_instructions[size]}

CONTENT REQUIREMENTS:
- Main topic: {topic}
- Subject area: {subject}
- Educational level: Grade {grade}
- Language: All text must be in {language}
"""

        # Add labeling instructions
        if include_labels:
            prompt += "\n- LABELS: Include clear, readable labels for all important parts and components"
        else:
            prompt += "\n- LABELS: Minimal labeling - let the visual speak for itself"

        # Add explanation instructions
        if include_explanation:
            prompt += "\n- EXPLANATION: Include brief explanatory text or captions where helpful"
        else:
            prompt += "\n- EXPLANATION: Focus purely on visual elements without explanatory text"

        # Add style-specific instructions
        if style == 'simple':
            prompt += "\n- STYLE: Clean, minimalist design with clear lines and simple shapes"
        elif style == 'detailed':
            prompt += "\n- STYLE: Rich in detail with comprehensive visual information"
        else:
            prompt += "\n- STYLE: Balanced approach with appropriate level of detail"

        # Add educational context
        prompt += f"""

EDUCATIONAL CONTEXT:
- This visual aid will be used by teachers in Indian schools
- Should be culturally appropriate and relatable to Indian students
- Must be clear enough to be understood by {age_descriptions.get(grade, f'Grade {grade} students')}
- Should facilitate learning and engagement in the classroom

TECHNICAL REQUIREMENTS:
- High contrast for visibility
- Clear, legible text that can be read from a distance
- Well-organized layout with logical flow
- Professional appearance suitable for educational use"""

        # Add any additional instructions
        if additional_instructions:
            prompt += f"\n\nADDITIONAL REQUIREMENTS:\n{additional_instructions}"

        # Final quality instructions
        prompt += """

QUALITY STANDARDS:
- Ensure all text is spelled correctly and grammatically proper
- Make sure the visual hierarchy guides the eye naturally
- Verify that all elements serve an educational purpose
- Create something that teachers will be proud to use in their classrooms"""

        return prompt

# Global instance will be created when needed
image_generator = None

def get_image_generator():
    """Get or create the global ImageGenerator instance."""
    global image_generator
    if image_generator is None:
        image_generator = ImageGenerator()
    return image_generator