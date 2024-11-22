const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user; // Dodaj użytkownika do requesta
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authMiddleware;
