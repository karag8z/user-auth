const status = require("http-status");
const errorHandler = (err, req, res, next) => {
  var error = {
    message: err.message || "Somethings gone wrong. Please try again later.",
    code: err.statusCode || status.INTERNAL_SERVER_ERROR,
  };

  if (err.code == 11000) {
    error.message = `${Object.keys(err.keyPattern)[0]} already registered`;
    error.code = status.CONFLICT;
  }
  if (err.name == "ValidationError") {
    error.message = err.message;
    error.code = status.BAD_REQUEST;
  }

  res.status(error.code).json({ message: error.message });
};

module.exports = errorHandler;
