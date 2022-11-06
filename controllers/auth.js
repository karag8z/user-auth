const User = require("../models/user");
const { checkUserPassword, createRefreshToken, createLoginJWT, checkRefreshToken } = require("../utils/helper");
const RedisClient = require("../utils/redis");

const register = async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send("OK");
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) return res.status(422).json({ error: "email or password wrong" });
  const compare = await checkUserPassword(password, user.password);
  if (!compare) return res.status(422).json({ error: "email or password wrong" });
  const token = createLoginJWT(user._id);
  const refreshToken = createRefreshToken(user._id);
  await RedisClient.connect();
  await RedisClient.RPUSH(user._id.toString(), [refreshToken.toString()]);
  await RedisClient.disconnect();
  res.send({
    status: "OK",
    token: token,
    refresh: refreshToken,
  });
};

const refresh = async (req, res) => {
  const { refresh_token, uid } = req.body;
  const isvalid = await checkRefreshToken(refresh_token, uid);
  if (!isvalid) {
    return res.status(403).json({ msg: "invalid refreshToken" });
  }
  const newToken = createLoginJWT(uid);
  res.send({ token: newToken });
};

module.exports = { register, login, refresh };
