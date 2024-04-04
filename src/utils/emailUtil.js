const nodemailer = require("nodemailer");
const { veificationtemplate } = require("./emailtemplates/verification");
const { passwordtemplate } = require("./emailtemplates/password");
require("dotenv").config();
const { BadRequestError, InternalServerError } = require("../errors/index");

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmail = async (email, subject, html) => {
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: html,
    });
    return info;
  } catch (error) {
    console.log(error);
    throw new InternalServerError("Email not sent");
  }
};

const verificationEmail = async (user, otp) => {
  const subject = "Verify Your FASTQR Account";
  const html = veificationtemplate
    .replace("{{otp}}", otp)
    .replace("{{username}}", user.firstName);
  return sendEmail(user.email, subject, html);
};

const sendOtpToEmail = async (user, otp, type) => {
  let html;
  if (type === "password")
    html = passwordtemplate
      .replace("{{otp}}", otp)
      .replace("{{username}}", user.firstName);
  else if (type === "verification")
    html = veificationtemplate
      .replace("{{otp}}", otp)
      .replace("{{username}}", user.firstName);
  else throw new BadRequestError("Check type of OTP requested");
  const subject =
    type === "password"
      ? "FASTQR Password Reset OTP"
      : type === "verification"
      ? "FASTQR Account Verification OTP"
      : "FASTQR OTP";
  return sendEmail(user.email, subject, html);
};

module.exports = { verificationEmail, sendOtpToEmail };
