import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

model = load_model('finetuned_civic_problems_model.h5')

datagen = ImageDataGenerator(rescale=1./255)

train_dir = "Civic Problems/train"

dummy_data = datagen.flow_from_directory(
    train_dir,
    target_size=(224, 224),
    batch_size=1,
    class_mode='categorical'
)


class_indices = dummy_data.class_indices
class_labels = {v: k for k, v in class_indices.items()}


img_path = '4.jpg'

img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = img_array / 255.0 


pred = model.predict(img_array)
predicted_class = class_labels[np.argmax(pred)]

print(f"Predicted class: {predicted_class}")
