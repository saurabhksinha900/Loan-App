// AI Pricing Engine using DCF methodology
class PricingEngine {
  calculatePrice(loanData, riskScore) {
    const principal = parseFloat(loanData.loan_amount);
    const annualRate = parseFloat(loanData.interest_rate) / 100;
    const termMonths = parseInt(loanData.term_months);
    
    // Calculate monthly payment
    const monthlyRate = annualRate / 12;
    const numPayments = termMonths;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Risk-adjusted discount rate
    const baseDiscountRate = 0.05; // 5% base rate
    const riskPremium = riskScore * 0.15; // Up to 15% risk premium
    const discountRate = baseDiscountRate + riskPremium;
    const monthlyDiscountRate = discountRate / 12;
    
    // Calculate present value of cash flows
    let pv = 0;
    for (let month = 1; month <= numPayments; month++) {
      pv += monthlyPayment / Math.pow(1 + monthlyDiscountRate, month);
    }
    
    // Apply liquidity discount
    const liquidityDiscount = 0.02; // 2% discount for illiquidity
    const fairValue = pv * (1 - liquidityDiscount);
    
    return {
      ai_price: fairValue,
      monthly_payment: monthlyPayment,
      total_payments: monthlyPayment * numPayments,
      discount_rate: discountRate,
      yield_to_maturity: this.calculateYTM(fairValue, monthlyPayment, numPayments)
    };
  }
  
  calculateYTM(price, monthlyPayment, numPayments) {
    // Simplified YTM calculation using approximation
    const totalReturn = (monthlyPayment * numPayments) / price - 1;
    const annualizedReturn = totalReturn / (numPayments / 12);
    return annualizedReturn;
  }
}

module.exports = new PricingEngine();
