const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Rejestracja użytkownika
const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    // Hashowanie hasła i tworzenie użytkownika
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    next(error);
  }
};

// Logowanie użytkownika
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Znalezienie użytkownika
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // Generowanie tokenu
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
};

// Wylogowanie użytkownika
const logoutUser = async (req, res, next) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { subscription } = req.body;

    if (!["starter", "pro", "business"].includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true } // zwraca zaktualizowanego użytkownika
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateSubscription,
};
