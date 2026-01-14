"""
AI Risk Assessment Engine

Predicts:
- Probability of Default (PD)
- Expected Loss (EL)
- Risk Grade (A-D)

Provides SHAP-based explainability for regulatory compliance.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
import joblib
from typing import Dict, List, Tuple
from pathlib import Path
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class RiskAssessmentEngine:
    """
    Production-grade risk assessment engine with explainability.
    
    Uses Logistic Regression for interpretability and regulatory compliance.
    Generates SHAP explanations for all predictions.
    """
    
    FEATURE_NAMES = [
        'principal',
        'interest_rate',
        'tenure_months',
        'borrower_credit_score',
        'borrower_income',
        'emis_paid',
        'emis_missed',
        'current_outstanding',
        'payment_ratio',  # Derived: emis_paid / (emis_paid + emis_missed)
        'outstanding_ratio',  # Derived: current_outstanding / principal
    ]
    
    RISK_THRESHOLDS = {
        'A': (0.0, 0.05),   # 0-5% PD
        'B': (0.05, 0.15),  # 5-15% PD
        'C': (0.15, 0.30),  # 15-30% PD
        'D': (0.30, 1.00),  # 30%+ PD
    }
    
    def __init__(self, model_version: str = "1.0.0"):
        self.model_version = model_version
        self.model: LogisticRegression = None
        self.scaler: StandardScaler = None
        self.explainer = None
        self._is_trained = False
        
    def train(self, training_data: pd.DataFrame, labels: np.ndarray) -> Dict:
        """
        Train the risk assessment model.
        
        Args:
            training_data: DataFrame with loan features
            labels: Binary labels (1 = default, 0 = no default)
            
        Returns:
            Training metrics dictionary
        """
        logger.info(f"Training risk assessment model v{self.model_version}")
        
        # Prepare features
        X = self._prepare_features(training_data)
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train logistic regression
        self.model = LogisticRegression(
            random_state=42,
            max_iter=1000,
            class_weight='balanced',
            solver='lbfgs'
        )
        self.model.fit(X_scaled, labels)
        
        # Initialize SHAP explainer if available
        if SHAP_AVAILABLE:
            self.explainer = shap.LinearExplainer(self.model, X_scaled)
        else:
            self.explainer = None
            logger.warning("SHAP not available - explainability features disabled")
        
        self._is_trained = True
        
        # Calculate training metrics
        train_score = self.model.score(X_scaled, labels)
        
        metrics = {
            'accuracy': train_score,
            'n_samples': len(labels),
            'n_features': X.shape[1],
            'model_version': self.model_version,
            'trained_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Model trained with accuracy: {train_score:.4f}")
        return metrics
    
    def predict_risk(self, loan_data: Dict) -> Tuple[float, float, str]:
        """
        Predict risk for a single loan.
        
        Args:
            loan_data: Dictionary with loan attributes
            
        Returns:
            Tuple of (probability_of_default, expected_loss, risk_grade)
        """
        if not self._is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Prepare features
        features = self._extract_features(loan_data)
        X = pd.DataFrame([features], columns=self.FEATURE_NAMES)
        X_scaled = self.scaler.transform(X)
        
        # Predict probability of default
        prob_default = self.model.predict_proba(X_scaled)[0, 1]
        
        # Calculate expected loss
        lgd = 0.45  # Loss Given Default (45% industry standard)
        expected_loss = prob_default * lgd * loan_data['current_outstanding']
        
        # Determine risk grade
        risk_grade = self._determine_risk_grade(prob_default)
        
        return prob_default, expected_loss, risk_grade
    
    def explain_prediction(self, loan_data: Dict) -> List[Dict]:
        """
        Generate SHAP-based explanations for a prediction.
        
        Args:
            loan_data: Dictionary with loan attributes
            
        Returns:
            List of explanation dictionaries with feature impacts
        """
        if not self._is_trained:
            raise ValueError("Model must be trained before explanation")
        
        if not SHAP_AVAILABLE or self.explainer is None:
            logger.warning("SHAP not available - returning basic feature importance")
            # Return basic feature importance instead
            features = self._extract_features(loan_data)
            explanations = []
            for i, feature_name in enumerate(self.FEATURE_NAMES):
                explanations.append({
                    'feature_name': feature_name,
                    'feature_value': features[i],
                    'shap_value': 0.0,
                    'impact_description': f"{feature_name}={features[i]:.2f} (SHAP unavailable)"
                })
            return explanations
        
        # Prepare features
        features = self._extract_features(loan_data)
        X = pd.DataFrame([features], columns=self.FEATURE_NAMES)
        X_scaled = self.scaler.transform(X)
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X_scaled)[0]
        
        # Build explanations
        explanations = []
        for i, feature_name in enumerate(self.FEATURE_NAMES):
            impact = "increases" if shap_values[i] > 0 else "decreases"
            magnitude = abs(shap_values[i])
            
            explanation = {
                'feature_name': feature_name,
                'feature_value': features[i],
                'shap_value': float(shap_values[i]),
                'impact_description': f"{feature_name}={features[i]:.2f} {impact} default risk (magnitude: {magnitude:.4f})"
            }
            explanations.append(explanation)
        
        # Sort by absolute SHAP value (most important first)
        explanations.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        return explanations
    
    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features from raw loan data"""
        X = df.copy()
        
        # Calculate derived features
        X['payment_ratio'] = X['emis_paid'] / (X['emis_paid'] + X['emis_missed'] + 1)
        X['outstanding_ratio'] = X['current_outstanding'] / X['principal']
        
        # Select features in correct order
        return X[self.FEATURE_NAMES]
    
    def _extract_features(self, loan_data: Dict) -> List[float]:
        """Extract features from loan dictionary"""
        # Calculate derived features
        total_emis = loan_data['emis_paid'] + loan_data['emis_missed']
        payment_ratio = loan_data['emis_paid'] / (total_emis + 1)
        outstanding_ratio = loan_data['current_outstanding'] / loan_data['principal']
        
        return [
            loan_data['principal'],
            loan_data['interest_rate'],
            loan_data['tenure_months'],
            loan_data.get('borrower_credit_score', 650),  # Default if missing
            loan_data.get('borrower_income', 50000),  # Default if missing
            loan_data['emis_paid'],
            loan_data['emis_missed'],
            loan_data['current_outstanding'],
            payment_ratio,
            outstanding_ratio,
        ]
    
    def _determine_risk_grade(self, prob_default: float) -> str:
        """Determine risk grade based on probability of default"""
        for grade, (low, high) in self.RISK_THRESHOLDS.items():
            if low <= prob_default < high:
                return grade
        return 'D'  # Default to highest risk
    
    def save_model(self, path: Path) -> None:
        """Save model and scaler to disk"""
        if not self._is_trained:
            raise ValueError("Cannot save untrained model")
        
        path.mkdir(parents=True, exist_ok=True)
        
        model_file = path / f"risk_model_v{self.model_version}.pkl"
        scaler_file = path / f"risk_scaler_v{self.model_version}.pkl"
        
        joblib.dump(self.model, model_file)
        joblib.dump(self.scaler, scaler_file)
        
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path: Path) -> None:
        """Load model and scaler from disk"""
        model_file = path / f"risk_model_v{self.model_version}.pkl"
        scaler_file = path / f"risk_scaler_v{self.model_version}.pkl"
        
        if not model_file.exists() or not scaler_file.exists():
            raise FileNotFoundError(f"Model files not found in {path}")
        
        self.model = joblib.load(model_file)
        self.scaler = joblib.load(scaler_file)
        
        # Re-initialize explainer
        # Note: For production, we'd load background data for SHAP
        # For now, we'll skip explainer initialization on load
        self._is_trained = True
        
        logger.info(f"Model loaded from {path}")


# ============================================================================
# SYNTHETIC TRAINING DATA GENERATOR
# ============================================================================

def generate_synthetic_training_data(n_samples: int = 1000) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Generate synthetic training data for model development.
    
    In production, this would be replaced with real historical loan data.
    """
    np.random.seed(42)
    
    data = {
        'principal': np.random.uniform(10000, 500000, n_samples),
        'interest_rate': np.random.uniform(6, 18, n_samples),
        'tenure_months': np.random.choice([12, 24, 36, 48, 60], n_samples),
        'borrower_credit_score': np.random.randint(500, 850, n_samples),
        'borrower_income': np.random.uniform(30000, 200000, n_samples),
        'emis_paid': np.random.randint(0, 60, n_samples),
        'emis_missed': np.random.randint(0, 10, n_samples),
    }
    
    df = pd.DataFrame(data)
    df['current_outstanding'] = df['principal'] * np.random.uniform(0.3, 1.0, n_samples)
    
    # Generate labels based on risk factors
    # Higher interest rate, lower credit score, more missed EMIs → higher default probability
    default_prob = (
        0.3 * (df['interest_rate'] - 6) / 12 +  # Interest rate impact
        0.3 * (850 - df['borrower_credit_score']) / 350 +  # Credit score impact
        0.4 * df['emis_missed'] / (df['emis_paid'] + df['emis_missed'] + 1)  # Payment behavior
    )
    
    labels = (default_prob + np.random.normal(0, 0.1, n_samples) > 0.5).astype(int)
    
    return df, labels


# ============================================================================
# MODEL INITIALIZATION
# ============================================================================

def initialize_risk_model(model_path: Path, model_version: str = "1.0.0") -> RiskAssessmentEngine:
    """
    Initialize risk assessment model.
    
    If saved model exists, load it. Otherwise, train a new model.
    """
    engine = RiskAssessmentEngine(model_version=model_version)
    
    model_file = model_path / f"risk_model_v{model_version}.pkl"
    
    if model_file.exists():
        logger.info("Loading existing risk model")
        engine.load_model(model_path)
    else:
        logger.info("Training new risk model with synthetic data")
        training_data, labels = generate_synthetic_training_data(n_samples=5000)
        engine.train(training_data, labels)
        engine.save_model(model_path)
    
    return engine
