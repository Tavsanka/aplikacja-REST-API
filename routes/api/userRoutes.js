const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateSubscription,
  updateAvatar,
  verifyEmail,
  resendVerificationEmail,
} = require("../../controllers/usersController");

// Trasy dla użytkowników
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/current", authMiddleware, getCurrentUser);
router.patch("/", authMiddleware, updateSubscription);
router.patch("/avatars", authMiddleware, upload.single("avatar"), updateAvatar);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/verify", resendVerificationEmail);

module.exports = router;
