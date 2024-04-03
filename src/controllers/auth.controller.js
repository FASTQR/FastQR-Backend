const { createUser, loginUser } = require("../utils/auth.Util");
const { ResponseHandler } = require("../utils/responseHandler");

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

    newUser = {
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phone,
      countryCode: user.countryCode,
    };

    ResponseHandler.success(res, user, 200, "Login successful");
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

module.exports = {
  register,
  login,
  logout,
};
