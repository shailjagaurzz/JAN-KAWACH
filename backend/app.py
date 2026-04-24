from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load your trained model
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    complaint_text = data.get("complaint_text", "")
    
    if not complaint_text:
        return jsonify({"error": "No complaint_text provided"}), 400

    # Predict category
    prediction = model.predict([complaint_text])[0]
    
    return jsonify({"category": prediction})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
