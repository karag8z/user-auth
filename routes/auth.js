const router = require("express").Router();
const { login, register, refresh } = require("../controllers/auth");

const { validatorRegister, validatorLogin, validatorJWT } = require("../middlewares/validator");

router.route("/register").post(validatorRegister, register);
router.route("/login").post(validatorLogin, login);
router.route("/refresh").post(validatorJWT, refresh);

module.exports = router;
