const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  loan_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  originator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  borrower_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  loan_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  term_months: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  loan_type: {
    type: DataTypes.ENUM('personal', 'business', 'mortgage', 'auto'),
    allowNull: false
  },
  risk_grade: {
    type: DataTypes.STRING
  },
  risk_score: {
    type: DataTypes.DECIMAL(5, 4)
  },
  ai_price: {
    type: DataTypes.DECIMAL(15, 2)
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'sold', 'defaulted', 'completed'),
    defaultValue: 'draft'
  },
  near_token_id: {
    type: DataTypes.STRING,
    unique: true
  },
  borrower_credit_score: {
    type: DataTypes.INTEGER
  },
  borrower_income: {
    type: DataTypes.DECIMAL(15, 2)
  },
  collateral_value: {
    type: DataTypes.DECIMAL(15, 2)
  }
}, {
  tableName: 'loans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Loan;
