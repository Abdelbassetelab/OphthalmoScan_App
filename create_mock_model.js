import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';

// Create a directory for our model
const modelDir = path.join(process.cwd(), 'public', 'model', 'tfjs');
if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}

async function createMockModel() {
  // Create a simple model similar to what we'd expect from EfficientNetB3
  const model = tf.sequential();
  
  // Add convolutional layers similar to EfficientNetB3
  model.add(tf.layers.conv2d({
    inputShape: [224, 224, 3],
    filters: 16,
    kernelSize: 3,
    activation: 'relu'
  }));
  
  model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));
  
  model.add(tf.layers.conv2d({
    filters: 32,
    kernelSize: 3,
    activation: 'relu'
  }));
  
  model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));
  
  // Flatten and add dense layers
  model.add(tf.layers.flatten());
  
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dropout({rate: 0.2}));
  
  // Output layer for 4 classes (cataract, diabetic_retinopathy, glaucoma, normal)
  model.add(tf.layers.dense({
    units: 4,
    activation: 'softmax'
  }));
  
  // Compile the model (even though we won't train it)
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  // Save model to disk
  await model.save(`file://${modelDir}`);
  
  console.log(`Mock model saved to ${modelDir}`);
}

createMockModel().catch(console.error);
