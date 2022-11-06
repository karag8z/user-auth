const { validationResult, body } = require("express-validator");
const { filterdialcode } = require("../utils/helper");
exports.validatorRegister = async (req, res, next) => {
  await body("email").exists().withMessage("email is required").isEmail().withMessage("value should be email").run(req),
    await body("password")
      .exists()
      .withMessage("password is required")
      .isLength({ min: 6 })
      .withMessage("password should be a min 6 chars")
      .isLength({ max: 16 })
      .withMessage("password should be a max 16 chars")
      .run(req),
    await body("first_name")
      .exists()
      .withMessage("name is required")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("invalid name")
      .isLength({ min: 2 })
      .withMessage("name should be min 2 chars")
      .isLength({ max: 20 })
      .withMessage("name should be max 20 chars")
      .run(req),
    await body("surname")
      .exists()
      .withMessage("surname is required")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("invalid surname")
      .isLength({ min: 2 })
      .withMessage("surname should be min 2 chars")
      .isLength({ max: 20 })
      .withMessage("surname should be max 20 chars")
      .run(req),
    await body("birth_day").exists().withMessage("birthday is required").isDate().withMessage("birthday should be date").run(req),
    await body("country_code")
      .exists()
      .withMessage("country code is required")
      .custom((dialcode) => {
        if (filterdialcode(dialcode).length == 0) return false;
        else return true;
      })
      .run(req),
    await body("cell")
      .exists()
      .withMessage("cell is required")
      .isNumeric()
      .isLength({ min: 10 })
      .withMessage("number should be a 10 digits")
      .isLength({ max: 10 })
      .withMessage("number should be a 10 digits")
      .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const data = errors.mapped();
    return res.status(400).json({ data });
  }
  next();
};

exports.validatorUpdate = async (req, res, next) => {
  await body("first_name")
    .optional()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("invalid name")
    .isLength({ min: 2 })
    .withMessage("name should be min 2 chars")
    .isLength({ max: 20 })
    .withMessage("name should be max 20 chars")
    .run(req),
    await body("surname")
      .optional()
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("invalid surname")
      .isLength({ min: 2 })
      .withMessage("surname should be min 2 chars")
      .isLength({ max: 20 })
      .withMessage("surname should be max 20 chars")
      .run(req),
    await body("birth_day").optional().isDate().withMessage("birthday should be date").run(req),
    await body("country_code")
      .optional()
      .custom((dialcode) => {
        if (filterdialcode(dialcode).length == 0) return false;
        else return true;
      })
      .run(req),
    await body("cell")
      .optional()
      .isNumeric()
      .isLength({ min: 10 })
      .withMessage("number should be a 10 digits")
      .isLength({ max: 10 })
      .withMessage("number should be a 10 digits")
      .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const data = errors.mapped();
    return res.status(400).json({ data });
  }
  next();
};

exports.validatorLogin = async (req, res, next) => {
  await body("email").exists().isEmail().withMessage("invalid email").run(req),
    await body("password").exists().isLength({ min: 6 }).withMessage("invalid password").isLength({ max: 16 }).withMessage("invalid password").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const data = errors.mapped();
    return res.status(400).json({ data });
  }
  next();
};

exports.validatorPasswordChange = async (req, res, next) => {
  await body("old_psw").exists().isLength({ min: 6 }).withMessage("invalid password").isLength({ max: 16 }).withMessage("invalid password").run(req);
  await body("new_psw").exists().isLength({ min: 6 }).withMessage("invalid password").isLength({ max: 16 }).withMessage("invalid password").run(req);
  await body("new_psw2")
    .custom((psw, { req }) => {
      if (psw !== req.body.new_psw) throw new Error("Passwords not match");
      return true;
    })
    .exists()
    .isLength({ min: 6 })
    .withMessage("invalid password")
    .isLength({ max: 16 })
    .withMessage("invalid password")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const data = errors.mapped();
    return res.status(400).json({ data });
  }
  next();
};

exports.validatorJWT = async (req, res, next) => {
  await body("refresh_token").isJWT().withMessage("refresh token must be a jwt type").run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const data = errors.mapped();
    return res.status(400).json({ data });
  }
  next();
};
