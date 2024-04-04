const {
  createUser,
  loginUser,
  resetUserPassword,
  updateVerifiedStatus,
  updateUserPassword,
} = require("../utils/auth.Util");
const { verificationEmail } = require("../utils/emailUtil");
const { generateOTP, verifyOTP } = require("../utils/generateToken");
const { ResponseHandler } = require("../utils/responseHandler");
const { InternalServerError } = require("../errors/index");

const register = async (req, res, next) => {
  const {
    country,
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    countryCode,
  } = req.body;

  try {
    const user = await createUser(
      country,
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      countryCode
    );

    if (!user) {
      throw new InternalServerError("User registration failed");
    }

    const verficationEmailResponse = await verificationEmail(
      user,
      await generateOTP(user.id)
    );
    console.log("verficationEmailResponse", verficationEmailResponse);

    if (!verficationEmailResponse) {
      throw new InternalServerError("Email not sent");
    }

    const newUser = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phone,
      countryCode: user.countryCode,
    };

    ResponseHandler.success(res, newUser, 201, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    const token = user.createJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    const loggedInUser = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phone,
      countryCode: user.countryCode,
    };

    ResponseHandler.success(res, loggedInUser, 200, "Login successful");
  } catch (error) {
    next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  const { userId, otp } = req.body;

  try {
    const isVerified = await verifyOTP(userId, otp);
    if (!isVerified) {
      throw new InternalServerError("Account verification failed");
    }

    const updatedUser = await updateVerifiedStatus(userId, {
      isVerified: true,
    });

    ResponseHandler.success(
      res,
      updatedUser,
      200,
      "Account verified successfully"
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    ResponseHandler.success(res, user, 200, "Logout successful");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    await resetUserPassword(email);
    ResponseHandler.success(res, null, 200, "Reset password OTP sent");
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { email, password, otp } = req.body;
  try {
    const updatedUser = await updateUserPassword(email, { password }, otp);
    ResponseHandler.success(
      res,
      updatedUser,
      200,
      "Password updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  resetPassword,
  verifyAccount,
  updatePassword,
};
