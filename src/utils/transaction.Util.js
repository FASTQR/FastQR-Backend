const { User, Transaction, Wallet } = require("../model/model");
const { Op } = require("sequelize");
const { NotFoundError } = require("../errors");
async function fetUserTransactions(userId) {
  const user = await User.findByPk(userId, {
    include: {
      model: Wallet,
      attributes: ["id"],
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const transactions = await Transaction.findAll({
    where: {
      [Op.or]: [
        {
          creditWalletId: user.Wallet.id,
        },
        {
          debitWalletId: user.Wallet.id,
        },
      ],
    },
  });
  console.log(transactions);
  return transactions;
}

module.exports = { fetUserTransactions };
