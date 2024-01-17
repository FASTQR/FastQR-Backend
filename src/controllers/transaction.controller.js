const { fetUserTransactions } = require("../utils/transaction.Util");

const getAllUserTransactions = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const transactions = await fetUserTransactions(userId);

    return res.status(200).json({
      msg: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    console.log(error);
    next();
  }
};

module.exports = { getAllUserTransactions };
