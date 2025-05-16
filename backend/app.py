from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import uuid
from services.ai.model_service import model_service
from PIL import Image
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the API is running."""
    return jsonify({
        'status': 'healthy',
        'modelLoaded': model_service.model is not None
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """Analyze an eye scan image."""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    try:
        # Read the image data
        img_data = file.read()
        
        # Save the image with a unique filename
        original_filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{original_filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        with open(file_path, 'wb') as f:
            f.write(img_data)
        
        # Open the saved image with PIL
        logger.info(f"Opening image from path: {file_path}")
        img = Image.open(file_path)
        
        # Analyze the image
        logger.info("Analyzing image")
        analysis_results = model_service.analyze_image(img)
        logger.info(f"Analysis results: {analysis_results}")
        
        # Clean up the temporary file
        os.remove(file_path)
        
        # Return results
        return jsonify({
            'predictions': analysis_results
        }), 200
    
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)