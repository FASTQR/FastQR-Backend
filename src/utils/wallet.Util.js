const { User, Wallet } = require("../model/model");
const { BadRequestError } = require("../errors/index");

/**
 * Fetch wallet details for a specific user.
 * @param {string} userId - The ID of the user for whom wallet details should be fetched.
 * @returns {Promise<Wallet>} A Promise that resolves to the wallet details of the user.
 */
async function fetchWalletDetails(userId) {
  const user = await User.findByPk(userId, {
    include: {
      model: Wallet,
      attributes: ["balance"],
    },
  });

  return user.Wallet;
}

module.exports = { fetchWalletDetails };
