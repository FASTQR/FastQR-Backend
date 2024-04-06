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



module.exports = { fetchUserWalletDetails };
