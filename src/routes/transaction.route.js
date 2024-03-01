const express = require("express");
const router = express.Router();
const {
  getAllUserTransactions,
  getSingleTransaction,
  generatePaymentRequest,
  processPayment,
} = require("../controllers/transaction.controller");

router.get("/transactions/:userId", getAllUserTransactions);
router.get("/transactions/:userId/:transactionId", getSingleTransaction);
router.post("/transactions/:userId/generate", generatePaymentRequest);
router.post("/transactions/:userId/process", processPayment);

module.exports = router;
