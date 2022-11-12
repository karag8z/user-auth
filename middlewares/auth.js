const jwt = require("jsonwebtoken");

const checkToken = async (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ msg: "set token" });
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.LOGIN_SECRET);
  if (!decoded.isActive) return res.status(402).json({ msg: "email not confirmed" });
  req.uid = decoded.uid;
  next();
};

module.exports = checkToken;
