const { User } = require("../model/model");
const { BadRequestError } = require("../errors/index");

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

module.exports = { createPin, updatePin };
