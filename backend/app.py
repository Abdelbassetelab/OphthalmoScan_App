import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Constants
IMG_SIZE = 224
CLASSES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'model', 'model.weights.h5')

def create_model():
    """Create and return the EfficientNetB3-based model architecture."""
    try:
        # Create base model
        base_model = EfficientNetB3(weights=None, include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
        
        # Add custom layers
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(256, activation='relu')(x)
        predictions = Dense(len(CLASSES), activation='softmax')(x)
        
        # Create final model
        model = Model(inputs=base_model.input, outputs=predictions)
        return model
    except Exception as e:
        logger.error(f"Error creating model: {str(e)}")
        raise

def load_model():
    """Load the trained model with weights."""
    try:
        model = create_model()
        model.load_weights(MODEL_PATH)
        logger.info("Model loaded successfully")
        return model
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise

def preprocess_image(image):
    """Preprocess the image for model prediction."""
    try:
        # Resize image
        image = image.resize((IMG_SIZE, IMG_SIZE))
        
        # Convert to array and add batch dimension
        img_array = np.array(image)
        img_array = img_array.astype('float32') / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise

# Load the model at startup
try:
    model = load_model()
except Exception as e:
    logger.error(f"Failed to load model at startup: {str(e)}")
    model = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'modelLoaded': model is not None,
        'modelType': 'EfficientNetB3'
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Handle image prediction requests."""
    try:
        logger.info("Received prediction request")
        
        # Check if model is loaded
        if model is None:
            logger.error("Model not loaded")
            return jsonify({'error': 'Model not loaded'}), 500

        # Check if file was uploaded
        if 'image' not in request.files:
            logger.error("No image file in request")
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['image']
        logger.info(f"Processing image: {file.filename}")
        
        # Validate file type
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400

        # Open and preprocess image
        image = Image.open(file).convert('RGB')
        processed_image = preprocess_image(image)
        logger.info("Image preprocessed successfully")        # Make prediction
        predictions = model.predict(processed_image)
        logger.info("Model prediction completed")
        
        # Print raw prediction values for debugging
        logger.info(f"Raw predictions: {predictions[0]}")
        
        # Format results
        results = {
            'predictions': {
                class_name: float(prob)
                for class_name, prob in zip(CLASSES, predictions[0])
            },
            'top_prediction': CLASSES[np.argmax(predictions[0])]
        }
        
        # Log detailed prediction values
        for class_name, prob in zip(CLASSES, predictions[0]):
            logger.info(f"Prediction for {class_name}: {prob:.6f}")
        
        logger.info(f"Prediction successful. Top prediction: {results['top_prediction']}")
        return jsonify(results)

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Prediction error: {error_msg}")
        return jsonify({
            'error': 'Failed to analyze image',
            'details': error_msg
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
