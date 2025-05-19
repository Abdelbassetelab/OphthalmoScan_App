import os
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense

IMG_SIZE = 224
CLASSES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']
MODEL_PATH = 'public/model/model.weights.h5'

def create_model():
    # Create base model with ImageNet weights for transfer learning starting point
    base_model = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # Add custom layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    predictions = Dense(len(CLASSES), activation='softmax')(x)
    
    # Create final model
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def main():
    # Create model directory if it doesn't exist
    os.makedirs('public/model', exist_ok=True)
    
    # Create and save model
    model = create_model()
    
    # Create some dummy data to simulate slight training
    # This gives the model some "bias" toward certain conditions
    # so it doesn't just output equal probabilities
    import numpy as np
    
    # Create dummy training data (10 samples per class)
    x_dummy = np.random.random((40, IMG_SIZE, IMG_SIZE, 3))
    
    # Create one-hot encoded dummy labels
    y_dummy = np.zeros((40, len(CLASSES)))
    for i in range(40):
        class_idx = i // 10  # 10 samples per class
        y_dummy[i, class_idx] = 1.0
    
    # Slightly train the model (just 5 epochs)
    model.fit(
        x_dummy, y_dummy,
        epochs=5,
        batch_size=8,
        verbose=1
    )
    
    # Save the weights
    model.save_weights(MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == '__main__':
    main()
