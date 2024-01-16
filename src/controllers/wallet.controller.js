const { createPin, updatePin } = require("../utils/wallet.Util");

const createWalletPin = async (req, res, next) => {
  const userId = req.params.userId;
  const { pin } = req.body;
  try {
    const walletPin = await createPin(userId, pin);

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
  const { currentPin, pin } = req.body;

  try {
    const updatedWalletPin = await updatePin(userId, currentPin, pin);

    return res.status(201).json({
      message: "Transaction pin updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = { createWalletPin, updateWalletPin };
