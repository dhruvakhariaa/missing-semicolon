"""
Disease Prediction API - Flask Service
Jan Seva Portal - AI Health Checker
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add disease_model to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from disease_model.disease_predictor import DiseasePredictorAI

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize predictor
try:
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'disease_model')
    predictor = DiseasePredictorAI(model_dir=model_dir)
    print("✅ Disease Prediction Model loaded successfully!")
    print(f"   - Total symptoms: {len(predictor.symptoms_list)}")
    print(f"   - Total diseases: {len(predictor.label_encoder.classes_)}")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    predictor = None


# Disease to Department mapping
DISEASE_TO_DEPARTMENT = {
    "Fungal infection": "Dermatology",
    "Allergy": "General Medicine",
    "GERD": "Gastroenterology",
    "Chronic cholestasis": "Gastroenterology",
    "Drug Reaction": "General Medicine",
    "Peptic ulcer diseae": "Gastroenterology",
    "AIDS": "Infectious Disease",
    "Diabetes ": "Endocrinology",
    "Gastroenteritis": "Gastroenterology",
    "Bronchial Asthma": "Pulmonology",
    "Hypertension ": "Cardiology",
    "Migraine": "Neurology",
    "Cervical spondylosis": "Orthopedics",
    "Paralysis (brain hemorrhage)": "Neurology",
    "Jaundice": "Gastroenterology",
    "Malaria": "Infectious Disease",
    "Chicken pox": "Infectious Disease",
    "Dengue": "Infectious Disease",
    "Typhoid": "Infectious Disease",
    "hepatitis A": "Gastroenterology",
    "Hepatitis B": "Gastroenterology",
    "Hepatitis C": "Gastroenterology",
    "Hepatitis D": "Gastroenterology",
    "Hepatitis E": "Gastroenterology",
    "Alcoholic hepatitis": "Gastroenterology",
    "Tuberculosis": "Pulmonology",
    "Common Cold": "General Medicine",
    "Pneumonia": "Pulmonology",
    "Dimorphic hemmorhoids(piles)": "General Surgery",
    "Heart attack": "Cardiology",
    "Varicose veins": "Vascular Surgery",
    "Hypothyroidism": "Endocrinology",
    "Hyperthyroidism": "Endocrinology",
    "Hypoglycemia": "Endocrinology",
    "Osteoarthristis": "Orthopedics",
    "Arthritis": "Orthopedics",
    "(vertigo) Paroymsal  Positional Vertigo": "Neurology",
    "Acne": "Dermatology",
    "Urinary tract infection": "Urology",
    "Psoriasis": "Dermatology",
    "Impetigo": "Dermatology"
}


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": predictor is not None,
        "service": "disease-prediction-ai"
    })


@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    """Get list of all available symptoms"""
    if predictor is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    symptoms = predictor.get_all_symptoms()
    return jsonify({
        "success": True,
        "symptoms": symptoms,
        "total": len(symptoms)
    })


@app.route('/diseases', methods=['GET'])
def get_diseases():
    """Get list of all diseases the model can predict"""
    if predictor is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    diseases = predictor.get_all_diseases()
    return jsonify({
        "success": True,
        "diseases": diseases,
        "total": len(diseases)
    })


@app.route('/predict', methods=['POST'])
def predict_disease():
    """Predict disease from symptoms"""
    if predictor is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'symptoms' not in data:
            return jsonify({
                "success": False,
                "error": "No symptoms provided. Send JSON with 'symptoms' array."
            }), 400
        
        symptoms = data['symptoms']
        
        if not isinstance(symptoms, list) or len(symptoms) == 0:
            return jsonify({
                "success": False,
                "error": "Symptoms must be a non-empty array"
            }), 400
        
        # Get prediction
        result = predictor.predict(symptoms)
        
        # Add recommended department
        predicted_disease = result['predicted_disease']
        recommended_department = DISEASE_TO_DEPARTMENT.get(
            predicted_disease, 
            "General Medicine"  # Default
        )
        
        result['recommended_department'] = recommended_department
        result['success'] = True
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/metadata', methods=['GET'])
def get_metadata():
    """Get model metadata"""
    if predictor is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    metadata = predictor.get_metadata()
    return jsonify({
        "success": True,
        "metadata": {
            "model_name": metadata.get('model_name', 'SVM'),
            "train_accuracy": metadata.get('train_accuracy', 1.0),
            "test_accuracy": metadata.get('test_accuracy', 1.0),
            "n_diseases": metadata.get('n_diseases', 41),
            "n_symptoms": metadata.get('n_symptoms', 132),
            "training_date": metadata.get('training_date', 'Unknown')
        }
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 DISEASE PREDICTION AI SERVICE")
    print("="*60)
    print("Starting Flask server on http://localhost:5001")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
