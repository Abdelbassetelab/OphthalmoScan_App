import os
import certifi
os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

import httpx
import ssl
import requests
# Monkeypatch httpx to always use certifi's CA bundle
orig_create_default_context = ssl.create_default_context
def custom_create_default_context(*args, **kwargs):
    kwargs['cafile'] = certifi.where()
    return orig_create_default_context(*args, **kwargs)
ssl.create_default_context = custom_create_default_context

import numpy as np
import logging
import io
import base64
import json
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
from tensorflow.keras.applications.efficientnet import preprocess_input
import uvicorn

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Optional[Client] = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        logger.info("✅ Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase client: {str(e)}")
else:
    logger.warning("⚠️ Supabase configuration missing")

# Initialize FastAPI app with CORS
app = FastAPI(title="OphthalmoScan AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
IMG_SIZE = 224
CLASSES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'model', 'model_weights (1).h5')

def create_model():
    """Create the EfficientNetB3-based model architecture."""
    try:
        base_model = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(256, activation='relu')(x)
        predictions = Dense(len(CLASSES), activation='softmax')(x)
        model = Model(inputs=base_model.input, outputs=predictions)
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model
    except Exception as e:
        logger.error(f"Error creating model: {str(e)}")
        raise

def load_model():
    """Load the trained model with weights."""
    try:
        model = create_model()
        if os.path.exists(MODEL_PATH):
            model.load_weights(MODEL_PATH)
            logger.info("✅ Model loaded successfully")
            return model
        raise FileNotFoundError(f"Model weights not found at {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise

def save_prediction_to_supabase(
    prediction_data: Dict[str, Any],
    image_base64: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Save prediction to Supabase using direct REST API calls to bypass SSL issues."""
    if not supabase_url or not supabase_key:
        logger.warning("⚠️ Supabase configuration missing, skipping storage")
        return prediction_data
    
    try:
        # Generate unique ID and timestamp
        prediction_id = str(uuid.uuid4())
        saved_at = datetime.utcnow().isoformat()
        
        # Prepare data for storage
        supabase_data = {
            "id": prediction_id,
            "created_at": saved_at,
            "user_id": user_id or "anonymous",
            "diagnosis": prediction_data["top_prediction"],
            "confidence": float(prediction_data["confidence"]),
            "metadata": {
                "class_probabilities": prediction_data["predictions"]
            }
        }
        
        # Add image if provided
        if image_base64:
            supabase_data["image_url"] = f"data:image/jpeg;base64,{image_base64}"
        
        # Save to Supabase using direct REST API call
        api_url = f"{supabase_url}/rest/v1/predictions"
        
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        logger.info(f"Attempting to save prediction to Supabase via REST API...")
        response = requests.post(
            api_url,
            headers=headers,
            data=json.dumps(supabase_data),
            verify=certifi.where()  # Use certifi for SSL verification
        )
        
        # Check response
        if response.status_code in (200, 201):
            logger.info(f"✅ Saved prediction {prediction_id} to Supabase (Status: {response.status_code})")
            # Update prediction data with storage info
            prediction_data["prediction_id"] = prediction_id
            prediction_data["saved_at"] = saved_at
        else:
            logger.error(f"Error saving to Supabase: HTTP {response.status_code} - {response.text}")
        
        return prediction_data
        
    except Exception as e:
        logger.error(f"Error saving to Supabase: {str(e)}")
        return prediction_data

# Load model at startup
try:
    model = load_model()
except Exception as e:
    logger.error(f"Failed to load model at startup: {str(e)}")
    model = None

@app.post("/predict/")
async def predict(file: UploadFile = File(...), user_id: Optional[str] = None):
    """Handle image prediction requests."""
    # Log the user_id parameter received
    logger.info(f"Prediction request received with user_id: {user_id}")
    
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Read and process image
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert('RGB')
        image_array = np.array(image.resize((IMG_SIZE, IMG_SIZE)))
        processed_image = preprocess_input(np.expand_dims(image_array, axis=0))
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        
        # Format probabilities
        class_probabilities = {
            class_name: float(prob)
            for class_name, prob in zip(CLASSES, predictions[0])
        }
        
        # Get top prediction
        predicted_class = CLASSES[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))
        
        # Prepare response
        results = {
            "predictions": class_probabilities,
            "top_prediction": predicted_class,
            "confidence": confidence,
            "prediction_id": None,
            "saved_at": None
        }
        
        # Save to Supabase if possible
        try:
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            image_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            results = save_prediction_to_supabase(
                prediction_data=results,
                image_base64=image_base64,
                user_id=user_id
            )
        except Exception as e:
            logger.error(f"Error saving to Supabase: {str(e)}")
        
        return results
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("🚀 Starting OphthalmoScan AI FastAPI Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
