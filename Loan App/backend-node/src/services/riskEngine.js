// Simple risk assessment engine
class RiskEngine {
  calculateRiskScore(loanData) {
    // Extract features
    const creditScore = loanData.borrower_credit_score || 650;
    const loanAmount = parseFloat(loanData.loan_amount);
    const income = parseFloat(loanData.borrower_income) || loanAmount * 3;
    const dti = loanAmount / income;
    const ltv = loanData.collateral_value 
      ? loanAmount / parseFloat(loanData.collateral_value)
      : 0.8;

    // Simple scoring logic
    let score = 0.5; // Base score

    // Credit score impact (0-850 range, normalized)
    if (creditScore >= 750) score -= 0.2;
    else if (creditScore >= 700) score -= 0.1;
    else if (creditScore >= 650) score += 0.0;
    else if (creditScore >= 600) score += 0.1;
    else score += 0.2;

    // DTI impact
    if (dti < 0.3) score -= 0.1;
    else if (dti < 0.4) score += 0.0;
    else if (dti < 0.5) score += 0.1;
    else score += 0.2;

    // LTV impact
    if (ltv < 0.6) score -= 0.1;
    else if (ltv < 0.8) score += 0.0;
    else if (ltv < 0.9) score += 0.1;
    else score += 0.15;

    // Loan type impact
    const loanTypeRisk = {
      'mortgage': -0.05,
      'auto': 0.0,
      'personal': 0.1,
      'business': 0.15
    };
    score += loanTypeRisk[loanData.loan_type] || 0;

    // Clamp score between 0 and 1
    score = Math.max(0.05, Math.min(0.95, score));

    // Assign grade
    let grade;
    if (score < 0.15) grade = 'A';
    else if (score < 0.25) grade = 'B';
    else if (score < 0.40) grade = 'C';
    else if (score < 0.60) grade = 'D';
    else grade = 'E';

    return {
      risk_score: score,
      risk_grade: grade,
      probability_of_default: score,
      expected_loss: score * loanAmount,
      explanation: {
        credit_score_impact: creditScore >= 700 ? 'positive' : 'negative',
        dti_impact: dti < 0.4 ? 'positive' : 'negative',
        ltv_impact: ltv < 0.8 ? 'positive' : 'negative',
        loan_type_impact: loanData.loan_type
      }
    };
  }
}

module.exports = new RiskEngine();
