const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../../controllers/usersController");
const authMiddleware = require("../../middlewares/authMiddleware");

// Trasy dla użytkowników
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;
