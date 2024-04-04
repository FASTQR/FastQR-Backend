const { OTP, User } = require("../model/model");
const { BadRequestError, NotFoundError } = require("../errors/index");

const generateOTP = async (userId) => {
  console.log("Generating OTP for user", userId);
  const otp = Math.floor(1000 + Math.random() * 9000);
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const otpData = {
    otp,
    userId,
  };
  console.log("OTP data", otpData);

  try {
    const [updatedOTP, created] = await OTP.upsert(otpData);
    console.log("Updated OTP", updatedOTP);

    if (!created) {
      console.log("OTP already existed");
    }

    console.log("OTP generated successfully", otp);
    return otp;
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw new Error("Failed to generate OTP");
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

  // Delete the OTP after successful verification
  await OTP.destroy({ where: { userId } });

  return true;
};

module.exports = {
  generateOTP,
  verifyOTP,
};
