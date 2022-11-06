require("dotenv").config();
require("express-async-errors");

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();
const errorHandler = require("./middlewares/error");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const checkToken = require("./middlewares/auth");

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", checkToken, userRoutes);

app.use(errorHandler);
const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("db connected");
    app.listen(process.env.PORT, () => {
      console.log(`server working on *:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
