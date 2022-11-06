const jwt = require("jsonwebtoken");
const { checkUserRefreshToken } = require("../utils/helper");

const checkToken = async (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ msg: "set token" });
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.LOGIN_SECRET);

  req.uid = decoded.uid;
  next();
};

module.exports = checkToken;
