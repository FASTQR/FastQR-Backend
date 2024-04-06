const express = require("express");
const router = express.Router();
const {
  createTransactionPin,
  updateTransactionPin,
  getAllUserTransactions,
  getSingleTransaction,
  generatePaymentRequest,
  processPayment,
} = require("../controllers/transaction.controller");

router.route("/wallet/:userId").post(createTransactionPin);
router.route("/wallet/:userId").patch(updateTransactionPin);
router.get("/transactions/:userId", getAllUserTransactions);
router.get("/transactions/:userId/:transactionId", getSingleTransaction);
router.post("/transactions/:userId/generate", generatePaymentRequest);
router.post("/transactions/:userId/process", processPayment);

module.exports = router;
