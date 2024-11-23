const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateSubscription,
} = require("../../controllers/usersController");

// Trasy dla użytkowników
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/current", authMiddleware, getCurrentUser);
router.patch("/", authMiddleware, updateSubscription);

module.exports = router;
