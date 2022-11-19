const countriescode = require("../utils/country_code.json");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const mq = require("amqplib");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ api_key: process.env.CLOUD_API_KEY, cloud_name: process.env.CLOUD_NAME, api_secret: process.env.CLOUD_API_SECRET });

const RedisClient = require("../utils/redis");

exports.filterdialcode = (dialCode) => {
  return countriescode.filter((country) => {
    return country.dialCode === dialCode;
  });
};

exports.checkUserPassword = async (inputpsw, userpsw) => {
  return await bcrypt.compare(inputpsw, userpsw);
};

exports.createRefreshToken = (userID, isActive) => {
  return jwt.sign({ uid: userID, isActive: isActive }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRE });
};

exports.createLoginJWT = (userID, isActive) => {
  return jwt.sign({ uid: userID, isActive: isActive }, process.env.LOGIN_SECRET, { expiresIn: process.env.SIGN_EXPIRE });
};

exports.checkUserRefreshToken = async (userid, refreshToken) => {
  const user = await User.findOne({ _id: userid, refreshToken: refreshToken });
  if (user) return true;
  else return false;
};

exports.checkRefreshToken = async (token, uid) => {
  const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
  const d_uid = decoded.uid;
  if (uid != d_uid) return false;
  await RedisClient.connect();
  const rKeys = await RedisClient.lRange(uid.toString(), 0, -1);
  await RedisClient.disconnect();
  if (rKeys.length === 0) return false;
  var result = false;
  rKeys.forEach((rtoken) => {
    if (rtoken == token) result = true;
  });
  return decoded;
};

exports.createEmailKey = (uid) => {
  return jwt.sign({ uid: uid }, process.env.EMAIL_SECRET, { expiresIn: "30d" });
};

exports.createPasswordKey = (uid) => {
  return jwt.sign({ uid: uid }, process.env.PASSWORD_SECRET, { expiresIn: "1d" });
};

exports.checkEmailToken = (token) => {
  return jwt.verify(token, process.env.EMAIL_SECRET);
};

exports.checkPasswordToken = (token) => {
  return jwt.verify(token, process.env.PASSWORD_SECRET);
};

exports.logoutAll = async (uid) => {
  await RedisClient.connect();
  await RedisClient.del(uid.toString());
  await RedisClient.disconnect();
};

exports.logoutUser = async (uid, token) => {
  const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
  if (uid != decoded.uid) return false;
  await RedisClient.connect();
  await RedisClient.lRem(uid.toString(), 0, token.toString());
  await RedisClient.disconnect();
  return true;
};

exports.multerStorage = (filepath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, filepath);
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname);
    },
  });
};

exports.validatorError = (errors, next) => {
  if (!errors.isEmpty()) {
    const errorarray = errors.array();
    const err = { name: "ValidationError", message: errorarray[0].msg };
    next(err);
  }
  next();
};

exports.mqSendMail = async (data) => {
  const conn = await mq.connect(process.env.MQ_URL);
  const ch = await conn.createChannel();
  ch.sendToQueue("send-mail", Buffer.from(JSON.stringify(data)));
};

exports.cloudinaryUpload = async (filepath, uid) => {
  const result = await cloudinary.uploader.upload(filepath, { folder: uid });
  fs.unlinkSync(filepath);
  return { secure: result.secure_url, public: result.public_id };
};

exports.cloudinaryDelete = async (pkey) => {
  await cloudinary.uploader.destroy(pkey);
};
