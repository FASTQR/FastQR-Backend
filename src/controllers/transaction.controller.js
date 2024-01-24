const {
  fetchUserTransactions,
  fetchSingleTransaction,
} = require("../utils/transaction.Util");

const getAllUserTransactions = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const transactions = await fetchUserTransactions(userId);

    return res.status(200).json({
      msg: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleTransaction = async (req, res, next) => {
  const { userId, transactionId } = req.params;
  try {
    const transaction = await fetchSingleTransaction(transactionId);

    return res.status(200).json({
      msg: "Transaction fetched successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUserTransactions, getSingleTransaction };
