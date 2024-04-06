const { sequelize } = require("../config/database_config");
const { User, Transaction, Wallet } = require("../model/model");
const { Op } = require("sequelize");
const { NotFoundError, BadRequestError } = require("../errors");
const QRCode = require("qrcode");

/**
 * Create a transaction pin for a specific user.
 * @param {string} userId - The ID of the user for whom the pin should be created.
 * @param {string} pin - The pin to be created.
 * @throws {BadRequestError} Will throw a BadRequestError if any required field is missing or if validations fail.
 * @returns {Promise<User>} A Promise that resolves to the updated user with the created pin.
 */
async function createPin(userId, pin) {
  if (!userId || !pin) {
    throw new BadRequestError(
      `Missing required field: ${!userId ? "userId" : "Pin"}`
    );
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const pinRegex = /^\d{4}$/;
  if (!pinRegex.test(pin)) {
    throw new BadRequestError("Invalid pin");
  }

  user.transactionPin = pin;
  await user.save();

  return;
}

/**
 * Update a transaction pin for a specific user.
 * @param {string} userId - The ID of the user for whom the pin should be updated.
 * @param {string} currentPin - The user's current pin.
 * @param {string} pin - The pin to be created.
 * @throws {BadRequestError} Will throw a BadRequestError if any required field is missing or if validations fail.
 * @returns {Promise<User>} A Promise that resolves to the updated user with the updated pin.
 */
async function updatePin(userId, currentPin, pin) {
  if (!userId || !currentPin || !pin) {
    throw new BadRequestError(
      `Missing required field: ${
        !userId ? "userId" : !currentPin ? "currentPin" : "Pin"
      }`
    );
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const isTransactionPinValid = await user.compareTransactionPin(currentPin);

  if (!isTransactionPinValid) {
    throw new BadRequestError("Invalid Credentials");
  }

  const pinRegex = /^\d{4}$/;
  if (!pinRegex.test(pin)) {
    throw new BadRequestError("Invalid pin");
  }

  user.transactionPin = pin;
  await user.save();

  return;
}

/**
 * Fetch all transactions for a specific user.
 *
 * @param {string} userId - The ID of the user for whom transactions should be fetched.
 * @returns {Promise<Array>} A Promise that resolves to an array of formatted transactions.
 * @throws {NotFoundError} Will throw a NotFoundError if the user is not found.
 */
async function fetchUserTransactions(userId) {
  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, {
        include: {
          model: Wallet,
          attributes: ["id"],
        },
        transaction: t,
      });

      console.log("user", user);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      const transactions = await Transaction.findAll({
        where: {
          [Op.or]: [
            { creditWalletId: user.Wallet.id },
            { debitWalletId: user.Wallet.id },
          ],
        },
        include: [
          {
            model: Wallet,
            as: "creditWallet",
            attributes: ["id", "balance"],
          },
          {
            model: Wallet,
            as: "debitWallet",
            attributes: ["id", "balance"],
          },
        ],
        transaction: t,
      });

      const formattedTransactions = transactions.map((transaction) => {
        return {
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          narration: transaction.narration,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          type: transaction.creditWalletId ? "credit" : "debit",
          wallet: {
            id: transaction.creditWalletId
              ? transaction.creditWallet.id
              : transaction.debitWallet.id,
            balance: transaction.creditWalletId
              ? transaction.creditWallet.balance
              : transaction.debitWallet.balance,
          },
        };
      });

      return formattedTransactions;
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch details of a single transaction.
 *
 * @param {string} transactionId - The ID of the transaction to fetch.
 * @returns {Promise<Object>} A Promise that resolves to details of the single transaction.
 * @throws {NotFoundError} Will throw a NotFoundError if the transaction is not found.
 */
async function fetchSingleTransaction(transactionId) {
  try {
    const result = await sequelize.transaction(async (t) => {
      const transaction = await Transaction.findByPk(transactionId, {
        include: [
          {
            model: Wallet,
            as: "creditWallet",
            attributes: ["id", "balance"],
          },
          {
            model: Wallet,
            as: "debitWallet",
            attributes: ["id", "balance"],
          },
        ],
        transaction: t,
      });

      if (!transaction) {
        throw new NotFoundError("Transaction not found");
      }

      const transactionDetails = {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        narration: transaction.narration,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        type: transaction.creditWalletId ? "credit" : "debit",
        wallet: {
          id: transaction.creditWalletId
            ? transaction.creditWallet.id
            : transaction.debitWallet.id,
          balance: transaction.creditWalletId
            ? transaction.creditWallet.balance
            : transaction.debitWallet.balance,
        },
      };

      return transactionDetails;
    });

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate a transaction for a user.
 *
 * @param {string} userId - The ID of the user initiating the transaction.
 * @param {number} amount - The transaction amount.
 * @param {string} narration - The transaction narration.
 * @returns {Promise<string>} A Promise that resolves to the generated QR code.
 * @throws {NotFoundError} Will throw a NotFoundError if the user is not found.
 * @throws {BadRequestError} Will throw a BadRequestError if there is an issue generating the QR code.
 */
async function generateTransaction(userId, amount, narration) {
  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, {
        include: {
          model: Wallet,
          attributes: ["id"],
        },
        transaction: t,
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      const data = {
        amount,
        narration,
        creditWalletId: user.Wallet.id,
      };

      const stringData = JSON.stringify(data);
      const qrCode = await QRCode.toDataURL(stringData);

      if (!qrCode) {
        throw new BadRequestError("Error generating QR code");
      }

      return qrCode;
    });

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Process a payment based on a QR code.
 *
 * @param {string} userId - The ID of the user making the payment.
 * @param {string} base64String - The base64 encoded string containing payment details.
 * @returns {Promise<Object>} A Promise that resolves to the created transaction.
 * @throws {NotFoundError} Will throw a NotFoundError if the user is not found.
 */
async function sendPayment(userId, base64String) {
  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, {
        include: {
          model: Wallet,
          attributes: ["id"],
        },
        transaction: t,
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      const data = JSON.parse(Buffer.from(base64String, "base64").toString());

      const transaction = await Transaction.create(
        {
          amount: data.amount,
          narration: data.narration,
          debitWalletId: user.Wallet.id,
        },
        { transaction: t }
      );

      user.Wallet.balance -= data.amount;
      await user.Wallet.save({ transaction: t });

      return transaction;
    });

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createPin,
  updatePin,
  fetchUserTransactions,
  fetchSingleTransaction,
  generateTransaction,
  sendPayment,
};
