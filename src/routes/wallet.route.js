const express = require("express");
const router = express.Router();
const {
  fetchUserWalletDetails,
} = require("../controllers/wallet.controller");


router.route("/wallet/:userId").get(fetchUserWalletDetails);

module.exports = router;
