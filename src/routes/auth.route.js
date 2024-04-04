const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyAccount,
  updatePassword,
  resetPassword,
} = require("../controllers/auth.controller");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verify-account").post(verifyAccount);
router.route("/reset-password").post(resetPassword);
router.route("/update-password").post(updatePassword);
router.route("/logout").post(logout);

module.exports = router;
