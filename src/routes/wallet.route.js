const express = require("express");
const router = express.Router();
const {
  createWalletPin,
  updateWalletPin,
  fetchUserWalletDetails,
} = require("../controllers/wallet.controller");

router.route("/wallet/:userId").post(createWalletPin);
router.route("/wallet/:userId").patch(updateWalletPin);
router.route("/wallet/:userId").get(fetchUserWalletDetails);

module.exports = router;
