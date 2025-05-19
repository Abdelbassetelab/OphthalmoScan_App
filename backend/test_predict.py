import requests
import sys
import os
from PIL import Image

def test_prediction():
    # Use specific sample images from the public/model directory
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'model')
    print(f"Looking for sample images in {model_dir}")
    
    # Test all available sample images
    sample_images = [
        "1435_leftca.jpg",     # Cataract sample
        "10007_right_dr.jpeg", # Diabetic retinopathy sample
        "1212_rightg.jpg"      # Glaucoma sample
    ]
    
    for img_file in sample_images:
        sample_image = os.path.join(model_dir, img_file)
        print(f"\nTesting prediction with {sample_image}...")
        
        # Check if the image exists and is valid
        try:
            Image.open(sample_image).verify()
        except Exception as e:
            print(f"Error: The image at {sample_image} is not valid. {str(e)}")
            continue
        
        # Test the prediction endpoint
        url = 'http://localhost:5000/api/predict'
        
        with open(sample_image, 'rb') as img:
            files = {'image': img}
            response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("Prediction successful!")
            print(f"Top prediction: {result['top_prediction']}")
            print("All predictions:")
            for condition, probability in result['predictions'].items():
                print(f"  {condition}: {probability:.2%}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

if __name__ == "__main__":
    test_prediction()
