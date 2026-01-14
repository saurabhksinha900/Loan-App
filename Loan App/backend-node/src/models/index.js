const sequelize = require('../config/database');
const User = require('./User');
const Loan = require('./Loan');
const Transaction = require('./Transaction');

// Define associations
Loan.belongsTo(User, { foreignKey: 'originator_id', as: 'originator' });
User.hasMany(Loan, { foreignKey: 'originator_id', as: 'loans' });

Transaction.belongsTo(Loan, { foreignKey: 'loan_id', as: 'loan' });
Transaction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

module.exports = {
  sequelize,
  User,
  Loan,
  Transaction
};
