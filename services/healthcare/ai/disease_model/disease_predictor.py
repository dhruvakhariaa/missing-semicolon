import pickle
import numpy as np

class DiseasePredictorAI:
    def __init__(self, model_dir='disease_model'):
        # Load model and artifacts
        with open(f'{model_dir}/best_disease_model.pkl', 'rb') as f:
            self.model = pickle.load(f)
        with open(f'{model_dir}/label_encoder.pkl', 'rb') as f:
            self.label_encoder = pickle.load(f)
        with open(f'{model_dir}/symptoms_list.pkl', 'rb') as f:
            self.symptoms_list = pickle.load(f)
        with open(f'{model_dir}/model_metadata.pkl', 'rb') as f:
            self.metadata = pickle.load(f)

    def predict(self, symptoms_input):
        '''
        Predict disease from symptoms
        symptoms_input: List of symptoms (e.g., ['itching', 'skin_rash', 'nodal_skin_eruptions'])
        Returns: Dictionary with prediction details
        '''
        # Create feature vector
        features = np.zeros(len(self.symptoms_list))

        # Map input symptoms
        symptoms_found = []
        symptoms_not_found = []

        for symptom in symptoms_input:
            symptom_clean = symptom.lower().strip().replace(' ', '_')

            if symptom_clean in self.symptoms_list:
                idx = self.symptoms_list.index(symptom_clean)
                features[idx] = 1
                symptoms_found.append(symptom_clean)
            else:
                symptoms_not_found.append(symptom)

        # Reshape for prediction
        features = features.reshape(1, -1)

        # Predict
        prediction = self.model.predict(features)[0]
        disease = self.label_encoder.inverse_transform([prediction])[0]

        # Get probabilities
        if hasattr(self.model, 'predict_proba'):
            probabilities = self.model.predict_proba(features)[0]
            confidence = probabilities[prediction] * 100

            # Top 5 predictions
            top_5_idx = np.argsort(probabilities)[-5:][::-1]
            top_5_predictions = [
                {
                    'disease': self.label_encoder.inverse_transform([idx])[0],
                    'confidence': probabilities[idx] * 100
                }
                for idx in top_5_idx
            ]
        else:
            confidence = 100.0
            top_5_predictions = [{'disease': disease, 'confidence': 100.0}]

        return {
            'predicted_disease': disease,
            'confidence': confidence,
            'top_5_predictions': top_5_predictions,
            'symptoms_matched': symptoms_found,
            'symptoms_not_found': symptoms_not_found,
            'total_symptoms_input': len(symptoms_input),
            'symptoms_recognized': len(symptoms_found)
        }

    def get_all_symptoms(self):
        '''Return list of all possible symptoms'''
        return [s.replace('_', ' ').title() for s in self.symptoms_list]

    def get_all_diseases(self):
        '''Return list of all diseases'''
        return list(self.label_encoder.classes_)

    def get_metadata(self):
        '''Return model metadata'''
        return self.metadata
