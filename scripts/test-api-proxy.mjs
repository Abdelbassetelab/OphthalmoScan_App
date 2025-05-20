import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const testImage = () => {
  // Path to the sample image
  const imagePath = path.resolve('public/images/samples/1435_leftca.jpg');
  console.log(`Testing image: ${imagePath}`);
  
  // Create a form data object
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  
  // Send the request to our API proxy
  fetch('http://localhost:3000/api/ai/predict', {
    method: 'POST',
    body: form
  })
  .then(response => {
    console.log(`Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.predictions && data.top_prediction) {
      console.log(`\nTop prediction: ${data.top_prediction}`);
      console.log('Predictions:');
      Object.entries(data.predictions).forEach(([key, value]) => {
        console.log(`  ${key}: ${(value * 100).toFixed(2)}%`);
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
};

testImage();
