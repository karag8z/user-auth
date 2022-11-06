const { profile, logout, updateprofile, updatepassword, addavatar } = require("../controllers/user");
const { multerStorage } = require("../utils/helper");
const { validatorJWT, validatorUpdate, validatorPasswordChange } = require("../middlewares/validator");
const router = require("express").Router();
const multer = require("multer");

const storage = multerStorage("./uploads");
const upload = multer({ storage: storage });

router.route("/profile").get(profile).patch(validatorUpdate, updateprofile);
router.route("/password").patch(validatorPasswordChange, updatepassword);
router.route("/avatar").post(upload.single("avatar"), addavatar);
router.route("/logout").post(validatorJWT, logout);
module.exports = router;
