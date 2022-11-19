const User = require("../models/user");
const CustomError = require("../errors/customerror");
const { checkUserPassword, createRefreshToken, createLoginJWT, checkRefreshToken, createEmailKey, checkEmailToken, createPasswordKey, mqSendMail } = require("../utils/helper");
const RedisClient = require("../utils/redis");

const register = async (req, res) => {
  const user = new User(req.body);
  const savedUser = await user.save();
  savedUser.activationKey = createEmailKey(savedUser._id);
  await savedUser.save();
  const data = { uid: savedUser._id, type: "welcome.ejs" };
  await mqSendMail(data);
  res.send("OK");
};

const sendconfirmemail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) res.json({ message: "OK" });
  const token = createEmailKey(user._id);
  user.activationKey = token;
  await user.save();
  const data = { uid: user._id, type: "confirmemail.ejs" };
  mqSendMail(data);
  res.json({ message: "OK" });
};

const confirmemail = async (req, res) => {
  const { token } = req.query;
  const decoded = checkEmailToken(token);
  const user = await User.findById(decoded.uid);
  if (!user) throw new CustomError.NotFound("User not found!");
  if (user.isActive == true) throw new CustomError.BadRequest("User already confirmed!");
  if (user.activationKey != confirm_token) throw new CustomError.BadRequest("Tokens are not compare!");
  user.isActive = true;
  user.activationKey = "";
  await user.save();
  res.json({ message: "OK" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) throw new CustomError.UnAuthorized("Email or Password wrong!");
  const compare = await checkUserPassword(password, user.password);
  if (!compare) throw new CustomError.UnAuthorized("Email or Password wrong!");
  if (user.isActive != true) throw new CustomError.UnAuthorized("User email not verified!");
  const token = createLoginJWT(user._id, user.isActive);
  const refreshToken = createRefreshToken(user._id, user.isActive);
  await RedisClient.connect();
  await RedisClient.RPUSH(user._id.toString(), [refreshToken.toString()]);
  await RedisClient.disconnect();
  res.json({ message: "OK", token: token, refreshToken: refreshToken });
};

const resetpassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) return res.json({ message: "OK" });
  const token = createPasswordKey(user._id);
  user.passwordResetKey = token;
  await user.save();
  const data = { uid: user._id, type: "resetpassword.ejs" };
  mqSendMail(data);
  res.json({ message: "OK" });
};

const refresh = async (req, res) => {
  const { refresh_token, uid } = req.body;
  const isvalid = await checkRefreshToken(refresh_token, uid);
  if (!isvalid) {
    throw new CustomError.UnAuthorized("Invalid Refresh Token!");
  }
  const newToken = createLoginJWT(uid, isvalid.isActive);
  res.send({ message: "OK", token: newToken });
};

module.exports = { register, login, refresh, confirmemail, resetpassword, sendconfirmemail };
