const express = require('express');
const { Op } = require('sequelize');
const { Loan, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const riskEngine = require('../services/riskEngine');
const pricingEngine = require('../services/pricingEngine');

const router = express.Router();

// Create loan
router.post('/', authenticate, requireRole('originator', 'admin'), async (req, res) => {
  try {
    const loanData = {
      ...req.body,
      originator_id: req.user.id,
      loan_id: `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    // Calculate risk
    const riskAssessment = riskEngine.calculateRiskScore(loanData);
    loanData.risk_score = riskAssessment.risk_score;
    loanData.risk_grade = riskAssessment.risk_grade;

    // Calculate price
    const pricing = pricingEngine.calculatePrice(loanData, riskAssessment.risk_score);
    loanData.ai_price = pricing.ai_price;

    const loan = await Loan.create(loanData);

    res.status(201).json(loan);
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ message: 'Failed to create loan' });
  }
});

// Get all loans
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, loan_type, risk_grade, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (loan_type) where.loan_type = loan_type;
    if (risk_grade) where.risk_grade = risk_grade;

    const loans = await Loan.findAll({
      where,
      include: [{
        model: User,
        as: 'originator',
        attributes: ['id', 'full_name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: 'Failed to fetch loans' });
  }
});

// Get loan by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'originator',
        attributes: ['id', 'full_name', 'email']
      }]
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ message: 'Failed to fetch loan' });
  }
});

// Update loan
router.put('/:id', authenticate, requireRole('originator', 'admin'), async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && loan.originator_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await loan.update(req.body);
    res.json(loan);
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ message: 'Failed to update loan' });
  }
});

// Search loans
router.post('/search', authenticate, async (req, res) => {
  try {
    const {
      min_amount,
      max_amount,
      loan_types,
      risk_grades,
      min_interest_rate,
      max_interest_rate
    } = req.body;

    const where = { status: 'active' };

    if (min_amount) where.loan_amount = { ...where.loan_amount, [Op.gte]: min_amount };
    if (max_amount) where.loan_amount = { ...where.loan_amount, [Op.lte]: max_amount };
    if (loan_types && loan_types.length) where.loan_type = loan_types;
    if (risk_grades && risk_grades.length) where.risk_grade = risk_grades;
    if (min_interest_rate) where.interest_rate = { ...where.interest_rate, [Op.gte]: min_interest_rate };
    if (max_interest_rate) where.interest_rate = { ...where.interest_rate, [Op.lte]: max_interest_rate };

    const loans = await Loan.findAll({
      where,
      include: [{
        model: User,
        as: 'originator',
        attributes: ['id', 'full_name']
      }],
      limit: 20
    });

    res.json(loans);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;
