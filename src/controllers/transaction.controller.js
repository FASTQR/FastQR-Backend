const {
  createPin,
  updatePin,
  fetchUserTransactions,
  fetchSingleTransaction,
  generateTransaction,
  sendPayment,
} = require("../utils/transaction.Util");
const { ResponseHandler } = require("../utils/responseHandler");

const createTransactionPin = async (req, res, next) => {
  const userId = req.params.userId;
  const { pin } = req.body;
  try {
    const walletPin = await createPin(userId, pin);

    ResponseHandler.success(res, 201, "Transaction pin created successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateTransactionPin = async (req, res, next) => {
  const userId = req.params.userId;
  const { currentPin, pin } = req.body;

  try {
    const updatedWalletPin = await updatePin(userId, currentPin, pin);

    ResponseHandler.success(res, 201, "Transaction pin updated successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllUserTransactions = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const transactions = await fetchUserTransactions(userId);

    ResponseHandler.success(
      res,
      transactions,
      200,
      "Transactions fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

const getSingleTransaction = async (req, res, next) => {
  const { userId, transactionId } = req.params;
  try {
    const transaction = await fetchSingleTransaction(transactionId);

    ResponseHandler.success(
      res,
      transaction,
      200,
      "Transactions fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

// generate payment request
const generatePaymentRequest = async (req, res, next) => {
  const { userId } = req.params;
  const { amount, narration } = req.body;
  try {
    const transaction = await generateTransaction(userId, amount, narration);

    ResponseHandler.success(
      res,
      transaction,
      200,
      "Payment Request generated successfully"
    );
  } catch (error) {
    next(error);
  }
};

const processPayment = async (req, res, next) => {
  const { userId } = req.params;
  const { base64String } = req.body;
  try {
    const transaction = await sendPayment(userId, base64String);

    ResponseHandler.success(
      res,
      transaction,
      200,
      "Payment Request generated successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransactionPin,
  updateTransactionPin,
  getAllUserTransactions,
  getSingleTransaction,
  generatePaymentRequest,
  processPayment,
};
