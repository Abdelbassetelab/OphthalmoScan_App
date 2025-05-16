import tensorflow as tf
import os
import argparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Custom Swish activation layer
class SwishActivation(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super(SwishActivation, self).__init__(**kwargs)
    
    def call(self, inputs):
        return inputs * tf.sigmoid(inputs)
    
    def get_config(self):
        config = super(SwishActivation, self).get_config()
        return config

def convert_model(input_dir, output_path):
    """
    Convert a TensorFlow.js model to Keras H5 format.
    
    Args:
        input_dir (str): Directory containing the TensorFlow.js model files (.json and .bin)
        output_path (str): Path to save the converted .h5 model
    """
    try:
        logger.info(f"Loading TensorFlow.js model from {input_dir}")
        
        # Load the TensorFlow.js model
        custom_objects = {'SwishActivation': SwishActivation}
        with tf.keras.utils.custom_object_scope(custom_objects):
            model = tf.keras.models.load_model(input_dir)
        
        # Save as Keras .h5 model
        model.save(output_path)
        logger.info(f"Model successfully converted and saved to {output_path}")
        
        # Also save model weights separately
        weights_path = os.path.join(os.path.dirname(output_path), 'model_weights.h5')
        model.save_weights(weights_path)
        logger.info(f"Model weights saved separately to {weights_path}")
        
        return True
    except Exception as e:
        logger.error(f"Error converting model: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def create_model_from_efficientnet(output_path):
    """
    Create a new EfficientNetB3 model and save it in .h5 format.
    
    Args:
        output_path (str): Path to save the created .h5 model
    """
    try:
        logger.info("Creating EfficientNetB3 model")
        
        # Create base model
        base_model = tf.keras.applications.EfficientNetB3(
            include_top=False,
            weights='imagenet',
            input_shape=(224, 224, 3)
        )
        
        # Build model structure
        inputs = tf.keras.Input(shape=(224, 224, 3))
        x = base_model(inputs, training=False)
        x = tf.keras.layers.GlobalAveragePooling2D()(x)
        x = tf.keras.layers.Dropout(0.2)(x)
        x = tf.keras.layers.Dense(256, activation='relu')(x)
        outputs = tf.keras.layers.Dense(4, activation='softmax')(x)
        
        model = tf.keras.Model(inputs, outputs)
        
        # Compile the model
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Save model
        model.save(output_path)
        logger.info(f"New model created and saved to {output_path}")
        
        # Also save model weights separately
        weights_path = os.path.join(os.path.dirname(output_path), 'model_weights.h5')
        model.save_weights(weights_path)
        logger.info(f"Model weights saved separately to {weights_path}")
        
        return True
    except Exception as e:
        logger.error(f"Error creating model: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def main():
    parser = argparse.ArgumentParser(description='Convert TensorFlow.js model to Keras H5 format')
    parser.add_argument('--input', '-i', help='Input directory containing TensorFlow.js model files')
    parser.add_argument('--output', '-o', help='Output path for the converted .h5 model')
    parser.add_argument('--create-new', action='store_true', help='Create new EfficientNetB3 model instead of converting')
    
    args = parser.parse_args()
    
    if args.create_new:
        if not args.output:
            args.output = 'efficientnetb3-model.h5'
        create_model_from_efficientnet(args.output)
    else:
        if not args.input or not args.output:
            parser.error("--input and --output are required unless --create-new is specified")
        convert_model(args.input, args.output)

if __name__ == '__main__':
    main()
