const User = require("../models/user");
const CustomError = require("../errors/customerror");
const { logoutUser, logoutAll, cloudinaryUpload, cloudinaryDelete } = require("../utils/helper");

const profile = async (req, res) => {
  const uid = req.uid;
  const user = await User.findById(uid, { password: 0 });
  if (!user) throw new CustomError.NotFound("User not found!");
  res.send(user);
};

const updateprofile = async (req, res) => {
  console.log(req.body);

  const user = await User.findOneAndUpdate({ _id: req.uid }, req.body, { new: true }).select("-password");
  if (!user) throw new CustomError.NotFound("User not found!");
  res.send(user);
};

const updatepassword = async (req, res) => {
  const { new_psw } = req.body;
  const uid = req.uid;
  const user = await User.findById(uid);
  if (!user) throw new CustomError.NotFound("User not found!");
  user.password = new_psw;
  await user.save();
  await logoutAll(uid);
  res.send("OK");
};

const addavatar = async (req, res) => {
  if (!req.file) throw new CustomError.BadRequest("Image file should be provided !");
  const uid = req.uid;
  const path = req.file.path;
  const user = await User.findById(uid);
  if (!user) throw new CustomError.NotFound("User not found!");
  if (user.avatar_public != "") await cloudinaryDelete(user.avatar_public);
  const result = await cloudinaryUpload(path, uid);
  user.avatar = result.secure;
  user.avatar_public = result.public;
  await user.save();
  res.send("OK");
};

const logout = async (req, res) => {
  const { refresh_token } = req.body;
  await logoutUser(req.uid, refresh_token);
  res.send({ message: "OK" });
};

const logoutall = async (req, res) => {
  const uid = req.uid;
  await logoutAll(uid);
  res.send({ message: "OK" });
};

module.exports = { profile, logout, updateprofile, updatepassword, addavatar, logoutall };
