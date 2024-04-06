const { OTP, User } = require("../model/model");
const { BadRequestError, NotFoundError } = require("../errors/index");

const generateOTP = async (userId) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const otpData = {
    otp,
    userId,
  };

  try {
    const [updatedOTP, created] = await OTP.upsert(otpData);

    if (!created) {
      console.log("OTP already exists, updating...");
      await OTP.update(otpData, { where: { userId } });
    }

    return otp;
  } catch (error) {
    console.log("Error generating OTP:", error);
  }
};

const verifyOTP = async (userId, otp) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const savedOTP = await OTP.findOne({ where: { userId } });
  if (!savedOTP || savedOTP.otp !== otp) {
    throw new BadRequestError("Invalid OTP");
  }

  await OTP.destroy({ where: { userId } });

  return true;
};

module.exports = {
  generateOTP,
  verifyOTP,
};
