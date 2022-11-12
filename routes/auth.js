const router = require("express").Router();
const { login, register, refresh, confirmemail, resetpassword, sendconfirmemail } = require("../controllers/auth");

const { validatorRegister, validatorLogin, validatorJWT, validatorConfirmEmailToken, validatorEMAIL } = require("../middlewares/validator");

router.route("/register").post(validatorRegister, register);
router.route("/login").post(validatorLogin, login);
router.route("/refresh").post(validatorJWT, refresh);
router.route("/confirm-email").get(validatorConfirmEmailToken, confirmemail).post(validatorEMAIL, sendconfirmemail);
router.route("/reset-password").post(validatorEMAIL, resetpassword);

module.exports = router;
