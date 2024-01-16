const { createUser, loginUser } = require("../utils/auth.Util");

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

    return res.status(201).json({
      message: "User created successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phone,
        countryCode: user.countryCode,
      },
    });
  } catch (error) {
    console.log(error);
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

    res.status(200).json({
      message: "Login successful",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phone,
        countryCode: user.countryCode,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  register,
  login,
};
