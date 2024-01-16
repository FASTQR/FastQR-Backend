const { createPin, updatePin } = require("../utils/wallet.Util");

const createWalletPin = async (req, res, next) => {
  const userId = req.params.userId;
  const { pin } = req.body;
  try {
    const walletPin = createPin(userId, pin);

    return res.status(201).json({
      message: "Transaction pin created successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateWalletPin = async (req, res, next) => {
  const userId = req.params.userId;
  const { currentPin, newPin } = req.body;

  try {
    const walletPin = updatePin(userId, currentPin, newPin);

    return res.status(201).json({
      message: "Transaction pin updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = { createWalletPin, updateWalletPin };
