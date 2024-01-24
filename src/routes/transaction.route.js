const express = require("express");
const router = express.Router();
const {
  getAllUserTransactions,
  getSingleTransaction,
} = require("../controllers/transaction.controller");

router.get("/transactions/:userId", getAllUserTransactions);
router.get("/transactions/:userId/:transactionId", getSingleTransaction);

module.exports = router;
