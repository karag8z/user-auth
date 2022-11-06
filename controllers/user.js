const User = require("../models/user");
const { logoutUser, logoutAll, cloudinaryUpload, cloudinaryDelete } = require("../utils/helper");

const profile = async (req, res) => {
  const uid = req.uid;
  const user = await User.findById(uid, { password: 0 });
  res.send(user);
};

const updateprofile = async (req, res) => {
  console.log(req.body);

  const user = await User.findOneAndUpdate({ _id: req.uid }, req.body, { new: true }).select("-password");
  if (!user) return res.status(500).json({ err: "error" });
  res.send(user);
};

const updatepassword = async (req, res) => {
  const { new_psw } = req.body;
  const uid = req.uid;
  const user = await User.findById(uid);
  if (!user) return res.status(402).json({ msg: "error" });
  user.password = new_psw;
  await user.save();
  await logoutAll(uid);
  res.send("OK");
};

const addavatar = async (req, res) => {
  if (!req.file) return res.status(500).json({ msg: "Error" });
  const uid = req.uid;
  const path = req.file.path;
  const user = await User.findById(uid);
  if (!user) return res.status(500).json({ msg: "Error" });
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
  res.send({ status: "OK" });
};

module.exports = { profile, logout, updateprofile, updatepassword, addavatar };
