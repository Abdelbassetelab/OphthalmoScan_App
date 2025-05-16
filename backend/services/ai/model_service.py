import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RetinalAnalysisService:
    MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'model', 'model_weights.h5')

    def __init__(self):
        """Initialize the RetinalAnalysisService with model path."""
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load the model with weights."""
        if not os.path.exists(self.MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {self.MODEL_PATH}")
        
        try:
            logger.info(f"Creating model architecture and loading weights from {self.MODEL_PATH}")
            
            # Create base EfficientNetB3 for feature extraction
            base_model = tf.keras.applications.EfficientNetB3(
                weights=None,
                include_top=False,
                pooling='avg',
                input_shape=(300, 300, 3)
            )
            
            # Build the sequential model
            model = tf.keras.Sequential([
                base_model,
                tf.keras.layers.BatchNormalization(),
                tf.keras.layers.Dense(256, activation='relu'),
                tf.keras.layers.Dropout(0.5),
                tf.keras.layers.Dense(4, activation='softmax')
            ])
            
            # Compile the model
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            # Load weights
            try:
                model.load_weights(self.MODEL_PATH)
                logger.info("Successfully loaded weights")
            except Exception as weight_error:
                logger.warning(f"Regular weight loading failed, trying by_name: {str(weight_error)}")
                model.load_weights(self.MODEL_PATH, by_name=True, skip_mismatch=True)
                logger.info("Loaded weights with by_name=True and skip_mismatch=True")
            
            self.model = model
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise RuntimeError(f"Failed to load model: {str(e)}")

    def analyze_image(self, image_input):
        """
        Analyze an eye scan image.
        
        Args:
            image_input: PIL Image object
        
        Returns:
            List of predictions with labels and probabilities
        """
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        try:
            # Convert PIL image to numpy array and preprocess
            img = image_input.resize((300, 300))
            img_array = np.array(img)
            img_array = img_array / 255.0  # Normalize
            img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
            
            # Get predictions
            predictions = self.model.predict(img_array)
            
            # Map predictions to conditions
            conditions = ['normal', 'cataract', 'glaucoma', 'diabetic retinopathy']
            results = []
            
            for i, prob in enumerate(predictions[0]):
                results.append({
                    'label': conditions[i],
                    'probability': float(prob)
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            raise RuntimeError(f"Failed to analyze image: {str(e)}")

# Create and export the model service instance
model_service = RetinalAnalysisService()
