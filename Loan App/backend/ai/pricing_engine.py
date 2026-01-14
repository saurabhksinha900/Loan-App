"""
AI Pricing Engine

Calculates:
- Fair value price
- Yield to maturity
- Stress scenarios
- Pricing assumptions
"""

import numpy as np
from typing import Dict, Tuple
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class PricingEngine:
    """
    Production-grade loan pricing engine.
    
    Calculates fair value based on:
    - Expected cash flows
    - Risk-adjusted discount rate
    - Market conditions
    - Prepayment and default probabilities
    """
    
    # Market parameters (would be dynamically updated in production)
    RISK_FREE_RATE = 0.04  # 4% risk-free rate
    MARKET_RISK_PREMIUM = 0.06  # 6% market risk premium
    LIQUIDITY_PREMIUM = 0.02  # 2% illiquidity discount
    
    RISK_GRADE_SPREADS = {
        'A': 0.01,  # 1% spread for grade A
        'B': 0.03,  # 3% spread for grade B
        'C': 0.05,  # 5% spread for grade C
        'D': 0.08,  # 8% spread for grade D
    }
    
    def __init__(self):
        self.version = "1.0.0"
    
    def calculate_fair_value(
        self,
        loan_data: Dict,
        risk_score: float,
        risk_grade: str
    ) -> Dict:
        """
        Calculate fair value price for a loan.
        
        Args:
            loan_data: Loan attributes
            risk_score: Probability of default
            risk_grade: Risk grade (A-D)
            
        Returns:
            Pricing data dictionary
        """
        logger.info(f"Calculating fair value for loan with risk grade {risk_grade}")
        
        # Extract loan details
        principal = loan_data['principal']
        interest_rate = loan_data['interest_rate'] / 100  # Convert to decimal
        tenure_months = loan_data['tenure_months']
        monthly_emi = loan_data['monthly_emi']
        emis_paid = loan_data['emis_paid']
        current_outstanding = loan_data['current_outstanding']
        
        # Calculate remaining cash flows
        remaining_months = tenure_months - emis_paid
        
        if remaining_months <= 0:
            return {
                'suggested_price': current_outstanding,
                'yield_to_maturity': 0.0,
                'discount_rate': 0.0,
                'npv_cash_flows': current_outstanding,
                'assumptions': {
                    'loan_fully_repaid': True
                }
            }
        
        # Calculate risk-adjusted discount rate
        discount_rate = self._calculate_discount_rate(risk_score, risk_grade)
        
        # Calculate NPV of expected cash flows
        npv = self._calculate_npv(
            monthly_emi,
            remaining_months,
            discount_rate,
            risk_score
        )
        
        # Adjust for current outstanding to ensure price doesn't exceed value
        suggested_price = min(npv, current_outstanding * 0.98)  # Max 98% of outstanding
        
        # Calculate yield to maturity
        ytm = self._calculate_ytm(
            suggested_price,
            monthly_emi,
            remaining_months
        )
        
        # Generate assumptions
        assumptions = {
            'risk_free_rate': self.RISK_FREE_RATE,
            'risk_grade_spread': self.RISK_GRADE_SPREADS[risk_grade],
            'liquidity_premium': self.LIQUIDITY_PREMIUM,
            'probability_of_default': risk_score,
            'remaining_months': remaining_months,
            'discount_rate_annual': discount_rate,
            'calculation_date': datetime.utcnow().isoformat()
        }
        
        return {
            'suggested_price': round(suggested_price, 2),
            'yield_to_maturity': round(ytm * 100, 2),  # Convert to percentage
            'discount_rate': round(discount_rate * 100, 2),  # Convert to percentage
            'npv_cash_flows': round(npv, 2),
            'assumptions': assumptions
        }
    
    def run_stress_scenarios(
        self,
        loan_data: Dict,
        base_risk_score: float,
        risk_grade: str
    ) -> Dict:
        """
        Run stress test scenarios on loan pricing.
        
        Args:
            loan_data: Loan attributes
            base_risk_score: Base probability of default
            risk_grade: Risk grade
            
        Returns:
            Dictionary with scenario results
        """
        scenarios = {}
        
        # Base case
        base_pricing = self.calculate_fair_value(loan_data, base_risk_score, risk_grade)
        scenarios['base'] = {
            'price': base_pricing['suggested_price'],
            'ytm': base_pricing['yield_to_maturity'],
            'description': 'Base case scenario'
        }
        
        # Adverse scenario: PD increases by 50%
        adverse_risk = min(base_risk_score * 1.5, 1.0)
        adverse_pricing = self.calculate_fair_value(loan_data, adverse_risk, risk_grade)
        scenarios['adverse'] = {
            'price': adverse_pricing['suggested_price'],
            'ytm': adverse_pricing['yield_to_maturity'],
            'description': 'Default probability +50%',
            'price_change_pct': ((adverse_pricing['suggested_price'] / base_pricing['suggested_price']) - 1) * 100
        }
        
        # Severe scenario: PD doubles
        severe_risk = min(base_risk_score * 2.0, 1.0)
        severe_pricing = self.calculate_fair_value(loan_data, severe_risk, risk_grade)
        scenarios['severe'] = {
            'price': severe_pricing['suggested_price'],
            'ytm': severe_pricing['yield_to_maturity'],
            'description': 'Default probability doubles',
            'price_change_pct': ((severe_pricing['suggested_price'] / base_pricing['suggested_price']) - 1) * 100
        }
        
        # Optimistic scenario: PD decreases by 30%
        optimistic_risk = max(base_risk_score * 0.7, 0.001)
        optimistic_pricing = self.calculate_fair_value(loan_data, optimistic_risk, risk_grade)
        scenarios['optimistic'] = {
            'price': optimistic_pricing['suggested_price'],
            'ytm': optimistic_pricing['yield_to_maturity'],
            'description': 'Default probability -30%',
            'price_change_pct': ((optimistic_pricing['suggested_price'] / base_pricing['suggested_price']) - 1) * 100
        }
        
        return scenarios
    
    def _calculate_discount_rate(self, risk_score: float, risk_grade: str) -> float:
        """
        Calculate risk-adjusted discount rate.
        
        Components:
        - Risk-free rate
        - Risk grade spread
        - Liquidity premium
        - Individual loan risk adjustment
        """
        base_rate = self.RISK_FREE_RATE
        risk_spread = self.RISK_GRADE_SPREADS[risk_grade]
        liquidity = self.LIQUIDITY_PREMIUM
        individual_risk = risk_score * 0.05  # Additional spread for individual risk
        
        annual_rate = base_rate + risk_spread + liquidity + individual_risk
        
        # Convert to monthly rate
        monthly_rate = annual_rate / 12
        
        return annual_rate
    
    def _calculate_npv(
        self,
        monthly_emi: float,
        remaining_months: int,
        annual_discount_rate: float,
        prob_default: float
    ) -> float:
        """
        Calculate Net Present Value of expected cash flows.
        
        Adjusts for probability of default using survival probability.
        """
        monthly_discount = annual_discount_rate / 12
        
        # Calculate NPV with survival probability
        npv = 0.0
        survival_prob = 1.0
        monthly_default_rate = prob_default / remaining_months  # Simplified assumption
        
        for month in range(1, remaining_months + 1):
            # Discount factor
            discount_factor = 1 / ((1 + monthly_discount) ** month)
            
            # Expected cash flow adjusted for survival probability
            expected_cf = monthly_emi * survival_prob * discount_factor
            
            npv += expected_cf
            
            # Update survival probability
            survival_prob *= (1 - monthly_default_rate)
        
        return npv
    
    def _calculate_ytm(
        self,
        price: float,
        monthly_emi: float,
        remaining_months: int
    ) -> float:
        """
        Calculate Yield to Maturity using Newton-Raphson method.
        
        YTM is the internal rate of return.
        """
        if remaining_months <= 0 or price <= 0:
            return 0.0
        
        # Initial guess
        ytm_guess = 0.10  # 10% annual
        
        # Newton-Raphson iterations
        for _ in range(50):  # Max 50 iterations
            monthly_rate = ytm_guess / 12
            
            # Calculate PV and derivative
            pv = 0.0
            pv_derivative = 0.0
            
            for month in range(1, remaining_months + 1):
                discount = (1 + monthly_rate) ** month
                pv += monthly_emi / discount
                pv_derivative -= month * monthly_emi / (12 * discount * (1 + monthly_rate))
            
            # Newton-Raphson update
            diff = pv - price
            
            if abs(diff) < 0.01:  # Convergence threshold
                break
            
            ytm_guess = ytm_guess - (diff / pv_derivative)
            
            # Ensure reasonable bounds
            ytm_guess = max(0.001, min(ytm_guess, 0.50))  # 0.1% to 50%
        
        return ytm_guess


# ============================================================================
# INITIALIZATION
# ============================================================================

def initialize_pricing_engine() -> PricingEngine:
    """Initialize pricing engine"""
    logger.info("Initializing pricing engine")
    return PricingEngine()
