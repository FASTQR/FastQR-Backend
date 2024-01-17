const express = require("express");
const router = express.Router();
const {
  getAllUserTransactions,
} = require("../controllers/transaction.controller");

router.get("/transactions/:userId", getAllUserTransactions);

module.exports = router;
