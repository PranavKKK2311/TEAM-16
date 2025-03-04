from flask import Flask
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

app = Flask(__name__)

@app.route('/api/route')
def predict():
    model_file_path = r"C:\Users\Pranav\Desktop\emotion_prediction_model.pkl"
    model = joblib.load(model_file_path)
    
    def predict_emotion(heartbeat_rate, pulse_rate, hrv):
        input_data = np.array([[heartbeat_rate, pulse_rate, hrv]])

        predicted_emotion = model.predict(input_data)[0]
        if predicted_emotion == 0:
            status = "Most Stressed"
        elif predicted_emotion == 1:
            status = "Normal"
        elif predicted_emotion == 2:
            status = "Most Happy"
        else:
            status = "Unknown"

        return predicted_emotion, status

    heartbeat_rate = 68
    pulse_rate = 82
    hrv = abs(heartbeat_rate - pulse_rate)

    emotion, status = predict_emotion(heartbeat_rate, pulse_rate, hrv)
    print(f"Predicted Emotion Metric: {emotion}")
    print(f"Person's Emotional State: {status}")