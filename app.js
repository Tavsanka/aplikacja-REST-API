require("dotenv").config();
const connectDB = require("./config/database");

const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const errorMiddleware = require("./middlewares/errorMiddleware");
const contactsRouter = require("./routes/api/contactsRoutes");
const userRouter = require("./routes/api/userRoutes");

const app = express();

connectDB();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorMiddleware);

module.exports = app;
