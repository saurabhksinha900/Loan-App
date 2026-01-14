const express = require('express');
const { Op } = require('sequelize');
const { Transaction, Loan, User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create transaction
router.post('/', authenticate, async (req, res) => {
  try {
    const { loan_id, amount, ownership_percentage } = req.body;

    // Get loan
    const loan = await Loan.findByPk(loan_id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      loan_id,
      seller_id: loan.originator_id,
      buyer_id: req.user.id,
      amount,
      ownership_percentage,
      status: 'pending'
    });

    // Simulate NEAR transaction
    const nearTxHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await transaction.update({
      near_tx_hash: nearTxHash,
      status: 'completed'
    });

    await loan.update({ status: 'sold' });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Transaction failed' });
  }
});

// Get user transactions
router.get('/my-transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { seller_id: req.user.id },
          { buyer_id: req.user.id }
        ]
      },
      include: [
        {
          model: Loan,
          as: 'loan'
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'full_name']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Loan, as: 'loan' },
        { model: User, as: 'seller', attributes: ['id', 'full_name'] },
        { model: User, as: 'buyer', attributes: ['id', 'full_name'] }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
});

module.exports = router;
