const status = require("http-status");

class CustomError extends Error {
  constructor(message) {
    super(message);
  }
}

class BadRequest extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = status.BAD_REQUEST;
  }
}

class NotFound extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = status.NOT_FOUND;
  }
}

class UnAuthorized extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = status.UNAUTHORIZED;
  }
}

module.exports = {
  CustomError,
  BadRequest,
  NotFound,
  UnAuthorized,
};
