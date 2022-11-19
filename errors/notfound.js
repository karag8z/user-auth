const CustomError = require("./customerror");
const notfound = (req, res) => {
  throw new CustomError.NotFound("Route not found");
};

module.exports = notfound;
