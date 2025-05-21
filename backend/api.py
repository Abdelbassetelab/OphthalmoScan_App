import os
import numpy as np
import logging
import io
import base64
from datetime import datetime
import uuid
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense
import uvicorn

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="OphthalmoScan AI API", description="API for eye disease classification")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Import EfficientNet preprocessing
from tensorflow.keras.applications.efficientnet import preprocess_input

# Constants
IMG_SIZE = 224
CLASSES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']
MODEL_PATH = r"C:\Users\abelabba\Desktop\Projet\OphthalmoScan\OphthalmoScan-AI\public\model\model_weights (1).h5"

# Fallback paths in case the primary path doesn't exist
FALLBACK_PATHS = [
    os.path.join(os.path.dirname(__file__), '..', 'public', 'model', 'model_weights (1).h5'),
    os.path.join(os.path.dirname(__file__), '..', 'public', 'model', 'model.weights.h5'),
    os.path.join(os.path.dirname(__file__), 'model_weights.h5'),
]

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Optional[Client] = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
else:
    logger.warning("Supabase configuration missing. Check your .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")

def create_model():
    """Create and return the EfficientNetB3-based model architecture."""
    try:
        # Create base model with ImageNet weights as it was during training
        base_model = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
        
        # Add custom layers (same architecture as during training)
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(256, activation='relu')(x)
        predictions = Dense(len(CLASSES), activation='softmax')(x)
        
        # Create final model
        model = Model(inputs=base_model.input, outputs=predictions)
        
        # Compile model with the same settings as during training
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        return model
    except Exception as e:
        logger.error(f"Error creating model: {str(e)}")
        raise

def load_model():
    """Load the trained model with weights."""
    try:
        model = create_model()
        
        # Try to load the model from the primary path first
        if os.path.exists(MODEL_PATH):
            logger.info(f"Loading model from: {MODEL_PATH}")
            model.load_weights(MODEL_PATH)
            logger.info("Model loaded successfully from primary path")
            return model
        
        # If primary path doesn't exist, try fallback paths
        for fallback_path in FALLBACK_PATHS:
            if os.path.exists(fallback_path):
                logger.info(f"Primary model path not found. Loading from fallback path: {fallback_path}")
                model.load_weights(fallback_path)
                logger.info("Model loaded successfully from fallback path")
                return model
        
        # If we get here, no model path was found
        logger.error(f"No model weights file found at any of the specified paths")
        logger.error(f"Checked: {MODEL_PATH} and fallbacks: {FALLBACK_PATHS}")
        raise FileNotFoundError("Model weights file not found")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise

def preprocess_image(image):
    """Preprocess the image for model prediction using EfficientNet preprocessing."""
    try:
        # Resize image
        image = image.resize((IMG_SIZE, IMG_SIZE))
        
        # Convert to array
        img_array = np.array(image)
        
        # Ensure the image is float32 and in the right range for EfficientNet
        img_array = img_array.astype('float32')
        
        # Apply EfficientNet-specific preprocessing
        img_array = preprocess_input(img_array)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        logger.info(f"Image preprocessed successfully. Shape: {img_array.shape}, Range: [{img_array.min():.2f}, {img_array.max():.2f}]")
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

@app.get("/")
async def read_root():
    """Root endpoint returning status information."""
    return {
        "message": "OphthalmoScan AI API is running",
        "status": "healthy",
        "modelLoaded": model is not None,
        "modelType": "EfficientNetB3"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint compatible with the frontend."""
    return {
        "status": "healthy",
        "modelLoaded": model is not None,
        "modelType": "EfficientNetB3"
    }

@app.post("/predict/")
async def predict(
    file: UploadFile = File(...),
    user_id: str
):
    """
    Handle image prediction requests and save results to Supabase.
    
    Args:
        file: The uploaded image file
        user_id: Required user ID for authentication. Must not be anonymous.
    """
    if not user_id or user_id.lower() == 'anonymous':
        raise HTTPException(status_code=401, detail="A valid user ID is required")
        
    logger.info(f"📥 Received prediction request for file: {file.filename}")
    logger.info(f"👤 User ID: {user_id}")
    logger.info(f"🔗 Supabase Status: {'Connected' if supabase else 'Not Connected'}")
    
    # Verify Supabase connection
    if not supabase:
        logger.warning("⚠️ Supabase client not initialized. Check environment variables:"
                      f"\nSUPABASE_URL: {'Set' if os.getenv('SUPABASE_URL') else 'Not Set'}"
                      f"\nSUPABASE_SERVICE_ROLE_KEY: {'Set' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'Not Set'}")
    try:
        logger.info(f"Received prediction request for file: {file.filename} from user: {user_id}")
        
        # Check if model is loaded
        if model is None:
            logger.error("Model not loaded")
            raise HTTPException(status_code=500, detail="Model not loaded")

        # Validate file type
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            logger.error(f"Invalid file type: {file.filename}")
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Read file content
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert('RGB')
        
        # Preprocess image
        processed_image = preprocess_image(image)
        logger.info("Image preprocessed successfully")
          # Make prediction with no verbosity
        predictions = model.predict(processed_image, verbose=0)
        logger.info("Model prediction completed")
        
        # Get raw probabilities and apply temperature scaling to smooth predictions
        temperature = 1.5  # Adjust this value to control prediction smoothness
        raw_probs = predictions[0]
        scaled_probs = np.exp(np.log(raw_probs) / temperature)
        scaled_probs = scaled_probs / np.sum(scaled_probs)  # Renormalize
        
        # Get class probabilities using the scaled predictions
        class_probabilities = {
            class_name: float(prob)
            for class_name, prob in zip(CLASSES, scaled_probs)
        }
        
        # Get predicted class and confidence from scaled probabilities
        predicted_class = CLASSES[np.argmax(scaled_probs)]
        confidence = float(np.max(scaled_probs))
        
        # Log raw predictions for debugging
        logger.info("Raw predictions: %s", 
                   {class_name: f"{prob:.4f}" 
                    for class_name, prob in zip(CLASSES, raw_probs)})
        
        # Log detailed prediction values
        for class_name, prob in class_probabilities.items():
            logger.info(f"Prediction for {class_name}: {prob:.6f}")
          # Format results in the format expected by the frontend
        results = {
            "predictions": class_probabilities,
            "top_prediction": predicted_class,
            "confidence": confidence,
            "prediction_id": None,  # Will be filled by Supabase
            "saved_at": None  # Will be filled by Supabase
        }
        
        # Convert image to base64 for storage
        try:
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            image_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Save to Supabase and get updated results
            results = save_prediction_to_supabase(
                prediction_data=results,
                image_base64=image_base64,
                user_id=user_id
            )
        except Exception as e:
            logger.error(f"Error preparing image for storage: {str(e)}")
            # Continue without storage - predictions are still valid
        
        logger.info(f"Prediction successful. Predicted class: {predicted_class}")
        return results

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Prediction error: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {error_msg}")

@app.post("/api/predict")
async def legacy_predict(file: UploadFile = File(...)):
    """Legacy endpoint compatible with the previous API path."""
    return await predict(file)

def save_prediction_to_supabase(
    prediction_data: Dict[str, Any],
    image_base64: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Save prediction results to Supabase and return updated prediction data.
    """
    if not supabase:
        logger.error("❌ Supabase client not configured")
        return prediction_data
    
    try:
        # Generate unique ID and timestamp
        prediction_id = str(uuid.uuid4())
        saved_at = datetime.utcnow().isoformat()
        
        logger.info(f"🔄 Preparing to save prediction {prediction_id} to Supabase")
        logger.info(f"👤 User ID: {user_id}")
        logger.info(f"📊 Prediction: {prediction_data['top_prediction']} ({prediction_data['confidence']:.2%})")
        
        # Prepare data for storage
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID is required")
            
        supabase_data = {
            "id": prediction_id,
            "user_id": user_id,  # No more fallback to "anonymous"
            "created_at": saved_at,
            "scan_type": "fundus",
            "scan_date": saved_at,
            "diagnosis": prediction_data["top_prediction"],
            "confidence": float(prediction_data["confidence"]),
            "diagnosis_date": saved_at,
            "ai_generated": True,
            "verified": False,
            "metadata": {
                "class_probabilities": prediction_data["predictions"],
                "processing_info": "EfficientNetB3 model analysis",
                "original_filename": "uploaded_scan.jpg"
            }
        }
        
        # Add image if provided
        if image_base64:
            supabase_data["image_url"] = f"data:image/jpeg;base64,{image_base64}"
            logger.info("📸 Image data included in payload")
        
        logger.info("📤 Attempting to save to Supabase...")
        
        # Save to Supabase with error details
        try:
            result = supabase.table("predictions").insert(supabase_data).execute()
            if not result.data:
                raise Exception("No data returned from Supabase")
            
            logger.info(f"✅ Successfully saved prediction {prediction_id} to Supabase")
            
            # Update prediction data with storage info
            prediction_data["prediction_id"] = prediction_id
            prediction_data["saved_at"] = saved_at
            return prediction_data
            
        except Exception as se:
            logger.error(f"❌ Supabase insert error: {str(se)}")
            if hasattr(se, 'message'):
                logger.error(f"Error message: {se.message}")
            raise
        
    except Exception as e:
        logger.error(f"❌ Error in save_prediction_to_supabase: {str(e)}")
        if hasattr(e, 'message'):
            logger.error(f"Error message: {e.message}")
        return prediction_data

if __name__ == "__main__":
    logger.info("Starting OphthalmoScan AI FastAPI Server...")
    logger.info(f"Model path: {MODEL_PATH}")
    
    # Try ports 8000, 8001, 8002 in sequence
    ports = [8000, 8001, 8002]
    for port in ports:
        try:
            logger.info(f"Attempting to start server on port {port}")
            uvicorn.run(app, host="0.0.0.0", port=port)
            break
        except OSError as e:
            if e.errno == 10048:  # Port already in use
                logger.warning(f"Port {port} is already in use, trying next port")
                if port == ports[-1]:
                    logger.error("All ports are in use. Please free up a port and try again.")
                    raise
            else:
                raise
