const { createPin, updatePin } = require("../utils/wallet.Util");
const { fetchWalletDetails } = require("../utils/wallet.Util");
const { ResponseHandler } = require("../utils/responseHandler");

const fetchUserWalletDetails = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const walletDetails = await fetchWalletDetails(userId);

    return res.status(200).json({
      message: "Wallet details fetched successfully",
      walletDetails,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const createWalletPin = async (req, res, next) => {
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

const updateWalletPin = async (req, res, next) => {
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

module.exports = { createWalletPin, updateWalletPin, fetchUserWalletDetails };
