import tensorflow as tf
import os

# Disable eager execution
tf.compat.v1.disable_eager_execution()

# Path to the h5 model
model_path = r"c:\Users\abelabba\Desktop\Projet\OphthalmoScan\OphthalmoScan-AI\public\model\model_weights.h5"

# Output directory
output_dir = r"c:\Users\abelabba\Desktop\Projet\OphthalmoScan\OphthalmoScan-AI\public\model\tfjs"

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Load the model
model = tf.keras.models.load_model(model_path)

# Save the model in TensorFlow.js format
tfjs_path = os.path.join(output_dir, "model.json")
tfjs_layers_model_save_path = os.path.dirname(tfjs_path)

# Save the model using tf.saved_model.save
saved_model_dir = os.path.join(output_dir, "saved_model")
tf.saved_model.save(model, saved_model_dir)

print(f"Model saved to {saved_model_dir}")
print(f"Now convert this to TensorFlow.js format using:")
print(f"tensorflowjs_converter --input_format=tf_saved_model {saved_model_dir} {tfjs_layers_model_save_path}")
