const { User, Transaction, Wallet } = require("../model/model");
const { Op } = require("sequelize");
const { NotFoundError } = require("../errors");

/**
 * Fetch all transactions for a specific user.
 * @param {string} userId - The ID of the user for whom transactions should be fetched.
 * @returns {Promise<Array>} A Promise that resolves to an array of formatted transactions.
 * @throws {NotFoundError} Will throw a NotFoundError if the user is not found.
 */
async function fetchUserTransactions(userId) {
  const user = await User.findByPk(userId, {
    include: {
      model: Wallet,
      attributes: ["id"],
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Find all transactions where the user's Wallet ID matches either creditWalletId or debitWalletId
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

  // Format transactions to include specific details
  const formattedTransactions = transactions.map((transaction) => {
    const type =
      transaction.creditWalletId === user.Wallet.id ? "credit" : "debit";
    return {
      id: transaction.id,
      type,
      amount: transaction.amount,
      narration: transaction.narration,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  });

  return formattedTransactions;
}

/**
 * Fetch details of a single transaction.
 * @param {string} transactionId - The ID of the transaction to fetch.
 * @returns {Promise<Object>} A Promise that resolves to details of the single transaction.
 * @throws {NotFoundError} Will throw a NotFoundError if the transaction is not found.
 */
async function fetchSingleTransaction(transactionId) {
  const transaction = await Transaction.findByPk(transactionId, {
    include: [
      {
        model: Wallet,
        as: "creditWallet",
        attributes: ["id", "balance"],
      },
      {
        model: Wallet,
        as: "debitWallet",
        attributes: ["id", "balance"],
      },
    ],
  });

  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }

  // Determine the type of transaction (credit or debit) and extract relevant details
  let transactionDetails = {
    id: transaction.id,
    amount: transaction.amount,
    status: transaction.status,
    narration: transaction.narration,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    type: transaction.creditWalletId ? "credit" : "debit",
    wallet: {
      id: transaction.creditWalletId
        ? transaction.creditWallet.id
        : transaction.debitWallet.id,
      balance: transaction.creditWalletId
        ? transaction.creditWallet.balance
        : transaction.debitWallet.balance,
    },
  };

  return transactionDetails;
}

module.exports = { fetchUserTransactions, fetchSingleTransaction };
