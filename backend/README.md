# Eye Scan Analysis Backend
This is a Flask-based backend service for the OphthalmoScan AI application. It uses a modular service architecture with a RetinalAnalysisService to load a pre-trained EfficientNetB3 model and provides an API for eye scan image analysis.

## Features
- Uses a modular service architecture with RetinalAnalysisService
- Loads and serves a pre-trained EfficientNetB3 model for eye disease detection
- Provides a RESTful API endpoint for image analysis
- Supports both file uploads and base64-encoded image data
- Applies biasing to match real-world disease prevalence
- Includes health check endpoint
- Multiple model loading strategies for reliability

## Architecture
The backend is implemented as a Flask RESTful API with a service-based architecture:

1. **Flask API Service (app.py)**: Handles HTTP requests, image uploads, and responses.
2. **Retinal Analysis Service (`services/ai/model_service.py`)**: Core service that loads the EfficientNetB3 model and performs the image analysis.
3. **TensorFlow Model**: The pre-trained EfficientNetB3 model for eye disease classification.

## Setup
### Local Development
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Run the server:
   ```
   python app.py
   ```

### Docker Deployment
1. Build the Docker image:
   ```
   docker build -t ophthalmoscan-api .
   ```
2. Run the container:
   ```
   docker run -p 5000:5000 -v "$(pwd)/../public/model:/app/model" ophthalmoscan-api
   ```

## API Endpoints
### Health Check
`GET /api/health`
Returns the status of the API and whether the model is loaded.

### Image Analysis
`POST /api/analyze`
Analyzes an eye scan image and returns predictions.

**Request Body:**
- Form data with an image file in the 'image' field, or
- JSON with base64-encoded image data in the 'imageData' field

**Response:**
```json
{
  "predictions": [
    {
      "label": "Cataract",
      "probability": 0.279
    },
    {
      "label": "Diabetic Retinopathy",
      "probability": 0.261
    },
    {
      "label": "Glaucoma",
      "probability": 0.261
    },
    {
      "label": "Normal",
      "probability": 0.199
    }
  ],
  "status": "success"
}
```

## RetinalAnalysisService

The backend uses a modular service architecture with the `RetinalAnalysisService` class that:

1. Automatically detects and loads the model from various possible locations
2. Preprocesses images to the required format
3. Performs prediction with proper error handling
4. Applies bias correction to match real-world disease prevalence
5. Returns formatted results for the frontend

## Model Conversion

If you need to convert a TensorFlow.js model to a Keras .h5 model, use the `convert_model.py` script:

```bash
python convert_model.py --input ../public/model --output ../public/model/efficientnetb3-Eye Disease-94.93.h5
```

Alternatively, you can create a new EfficientNetB3 model:

```bash
python convert_model.py --create-new --output ../public/model/efficientnetb3-model.h5
```
