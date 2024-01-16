const express = require("express");
const router = express.Router();
const {
  createWalletPin,
  updateWalletPin,
} = require("../controllers/wallet.controller");

router.route("/users/:userId/pin").post(createWalletPin);
router.route("/users/:userId/pin").patch(updateWalletPin);

module.exports = router;
