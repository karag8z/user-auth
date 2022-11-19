const jwt = require("jsonwebtoken");
const CustomError = require("../errors/customerror");
const checkToken = async (req, res, next) => {
  if (!req.headers.authorization) throw new CustomError.UnAuthorized("Acces Token not found!");
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.LOGIN_SECRET);
  if (!decoded.isActive) throw new CustomError.UnAuthorized("User email not verified!");
  req.uid = decoded.uid;
  next();
};

module.exports = checkToken;
