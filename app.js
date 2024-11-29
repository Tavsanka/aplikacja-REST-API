require("dotenv").config();
const connectDB = require("./config/database");

const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const logger = require("morgan");
const cors = require("cors");
const errorMiddleware = require("./middlewares/errorMiddleware");
const contactsRouter = require("./routes/api/contactsRoutes");
const userRouter = require("./routes/api/userRoutes");

const app = express();

// Funkcja do czyszczenia folderu tmp
const cleanupTmp = async () => {
  const tmpDir = path.join(__dirname, "tmp");
  try {
    const files = await fs.readdir(tmpDir);
    for (const file of files) {
      await fs.unlink(path.join(tmpDir, file));
    }
    console.log("Temporary files cleaned up.");
  } catch (error) {
    console.error("Error cleaning tmp folder:", error.message);
  }
};

// Uruchomienie czyszczenia folderu tmp
cleanupTmp().catch((error) => console.error("Error during cleanup:", error));

connectDB();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/avatars", express.static(path.join(__dirname, "public/avatars")));

// Dodanie logów do middleware'ów i tras
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

app.use("/api/users", userRouter);
app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);

  res.status(404).json({ message: "Not found" });
});

app.use(errorMiddleware);

module.exports = app;
