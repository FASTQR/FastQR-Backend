const { User } = require("../model/model");
const { BadRequestError, NotFoundError } = require("../errors/index");
const { sendOtpToEmail, verifyOtp } = require("./emailUtil");
const { generateOTP } = require("./generateToken");
const bcrypt = require("bcrypt");
const { InternalServerError } = require("../errors/index");

/**
 * Create a new user and store the information in the database.
 *
 * @param {string} country - The user's country.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} phoneNumber - The user's phone number.
 * @param {string} countryCode - The country code associated with the user's phone number.
 * @throws {BadRequestError} Will throw a BadRequestError if any required field is missing or if validations fail.
 * @returns {Promise<User>} A Promise that resolves to the created user.
 */
async function createUser(
  country,
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
  countryCode
) {
  switch (true) {
    case !country:
      throw new BadRequestError("Missing required field: Country");
    case !firstName:
      throw new BadRequestError("Missing required field: First Name");
    case firstName.length < 2:
      throw new BadRequestError(
        "First Name must be at least 2 characters long"
      );
    case !lastName:
      throw new BadRequestError("Missing required field: Last Name");
    case lastName.length < 2:
      throw new BadRequestError("Last Name must be at least 2 characters long");
    case !email:
      throw new BadRequestError("Missing required field: Email");
    case !password:
      throw new BadRequestError("Missing required field: Password");
    case !phoneNumber:
      throw new BadRequestError("Missing required field: Phone Number");
    case !countryCode:
      throw new BadRequestError("Missing required field: Country Code");
    case password.length < 8:
      throw new BadRequestError("Password must be at least 8 characters long");
  }

  const passwordStrengthRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  if (!passwordStrengthRegex.test(password)) {
    throw new BadRequestError(
      "Weak password. Include uppercase, lowercase, digits, and special characters"
    );
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestError("Invalid email address");
  }

  const existingUser = await User.findOne({
    where: { email: email, phone: phoneNumber },
  });

  if (existingUser) {
    throw new BadRequestError("User already exists");
  }

  const user = await User.create({
    country: country,
    firstName: firstName,
    lastName: lastName,
    email: email,
    passwordHash: password,
    phone: phoneNumber,
    countryCode: countryCode,
  });

  console.log("user", user);

  return user;
}

/**
 * Logs in a user.
 *
 * @param {string} email - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<import('../model/User')>} A Promise that resolves to the logged-in user.
 * @throws {BadRequestError} If required fields are not provided.
 * @throws {NotFoundError} If the user is not found or the credentials are invalid.
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new BadRequestError("Please Enter an Email or Password");
  }
  email = email.toLowerCase();
  console.log(email);
  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new BadRequestError("Invalid Credentials");
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestError("Invalid email address");
  }

  return user;
}

/**
 * Update the verification status of a user on the User Model.
 *
 * @param {string} userId - The ID of the user.
 * @param {object} data - The data to update (isVerified property).
 * @returns {Promise<import('../model/User')>} A Promise that resolves to the updated user.
 * @throws {NotFoundError} If the user is not found.
 */
async function updateVerifiedStatus(userId, data) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const updatedUser = await user.update(data);
  return updatedUser;
}

/**
 * Reset the password of a user.
 *
 * @param {string} email - The email address of the user.
 * @returns {Promise<import('../model/User')>} A Promise that resolves to the user whose password was reset.
 * @throws {BadRequestError} If required fields are not provided.
 * @throws {NotFoundError} If the user is not found or the credentials are invalid.
 */
async function resetUserPassword(email) {
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const otp = await generateOTP(user.id);
  if (!otp) {
    throw new InternalServerError("Error generating token");
  }

  const emailResponse = await sendOtpToEmail(user, otp, "password");
  if (!emailResponse) {
    throw new InternalServerError("Error sending email");
  }
}

/**
 * Update the password of a user.
 *
 * @param {string} email - The email address of the user.
 * @param {object} data - The data to update  (password).
 * @param {string} otp - The OTP sent to the user's email.
 * @returns {Promise<import('../model/User')>} A Promise that resolves to the updated user.
 * @throws {BadRequestError} If required fields are not provided.
 * @throws {NotFoundError} If the user is not found.
 */
async function updateUserPassword(email, data, otp) {
  if (!email || !data.password || !otp) {
    throw new BadRequestError("OTP, email, and password are required");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isOtpValid = await verifyOtp(otp, user.id);
  if (!isOtpValid) {
    throw new BadRequestError("Invalid OTP");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const updatedUser = await user.update({ password: hashedPassword });
  return updatedUser;
}

module.exports = {
  createUser,
  loginUser,
  resetUserPassword,
  updateVerifiedStatus,
  updateUserPassword,
};
