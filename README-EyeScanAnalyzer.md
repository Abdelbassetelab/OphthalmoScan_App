# Eye Scan Analyzer

A medical application that analyzes eye scans to detect various eye conditions using deep learning.

## Features

- Upload eye scan images for analysis
- Model classifies eye conditions:
  - Cataract
  - Diabetic Retinopathy
  - Glaucoma
  - Normal (healthy eye)
- Clean and intuitive user interface
- Confidence scores for each possible condition
- Client-side analysis for privacy and reduced server load

## Model Details

- **Original Architecture**: EfficientNetB3
- **Implementation**: TensorFlow.js mock model (for demonstration)
- **Input Size**: 224x224 pixels
- **Preprocessing**: Resize to 224x224, normalize (divide by 255)
- **Output**: Classification probabilities for 4 eye conditions

## Technical Implementation

### Dependencies

- TensorFlow.js for running the AI model in the browser
- Next.js for the web application framework

### Client-Side Processing

The eye scan analyzer now runs entirely in the client's browser:

1. A mock model resembling EfficientNetB3 is generated on the first visit
2. Model is saved to browser's localStorage for future use
3. Images are processed using the browser's built-in capabilities
4. Analysis runs locally without sending sensitive medical images to a server

### Using the Analyzer

1. Navigate to the scan analysis page
2. If this is your first visit, you'll be redirected to generate the model
3. Once the model is ready, return to the scan analysis page
4. Upload an eye scan image
5. Click "Analyze Image" to process the image
6. View the results showing the detected condition and confidence scores
2. Upload an eye scan image
3. Click "Analyze Image"
4. View the results showing the detected condition and confidence scores

## Important Notes

- This is for informational purposes only and should not replace professional medical advice
- For optimal results, use clear, focused images of the eye retina
- Processing may take a few moments depending on the server/client capabilities

## Privacy Considerations

- Images are processed on the server but not stored permanently
- No personal health information is retained after analysis

## Future Improvements

- Support for more eye conditions
- Enhanced visualization of detected features
- Downloadable PDF reports
- Multi-image batch processing
