# Testing the OphthalmoScan-AI Application

This document provides instructions for testing the OphthalmoScan-AI application after the migration from a client-side TensorFlow.js model to a server-side Python backend.

## Prerequisites

Before testing, make sure you have:

1. Set up the Python backend (see `backend/README.md` for details)
2. Installed all required dependencies for both the backend and frontend
3. The model files are correctly placed in the `public/model/` directory

## Testing Steps

### 1. Start the Backend Server

First, start the Python backend server:

```powershell
cd backend
python app.py
```

You should see logs indicating that:
- The Flask server has started on http://localhost:5000
- The RetinalAnalysisService has initialized
- The model has been loaded successfully

### 2. Verify Backend Health

Open your browser and navigate to:

```
http://localhost:5000/api/health
```

You should see a JSON response like:

```json
{
  "status": "healthy",
  "modelLoaded": true,
  "modelType": "Functional"
}
```

### 3. Start the Next.js Frontend

In a new terminal, start the frontend:

```powershell
npm run dev
```

### 4. Test the Generate Model Page

Open your browser and navigate to:

```
http://localhost:3000/generate-model
```

This page should now display information about the server-side model, including:
- Model type (EfficientNetB3)
- Classes (Cataract, Diabetic Retinopathy, Glaucoma, Normal)
- Server connection status

### 5. Test the Scan Analysis Page

Navigate to:

```
http://localhost:3000/scan-analysis
```

To test the scan analysis functionality:
1. Upload an eye scan image (you can use the sample image in `public/model/1435_leftca.jpg`)
2. Click "Analyze Image"
3. The backend should process the image and return predictions
4. Results should be displayed showing the predicted conditions and their probabilities

### 6. Troubleshooting

If you encounter issues:

- Check the browser console for frontend errors
- Check the terminal running the Flask app for backend errors
- Verify the `.env.local` file has the correct backend URL (should be `NEXT_PUBLIC_API_URL=http://localhost:5000`)
- Make sure the model files exist and are in the correct location
- Test the backend API directly using a tool like Postman

## Expected Behavior

When everything is working correctly:

1. The frontend connects to the Python backend server
2. Images are sent to the backend for processing
3. The EfficientNetB3 model runs on the server for better performance and accuracy
4. Results are returned to the frontend and displayed to the user
5. The entire process should be more reliable and accurate than the previous client-side model
