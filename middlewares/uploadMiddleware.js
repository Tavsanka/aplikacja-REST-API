const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");

// Konfiguracja ścieżek
const tmpDir = path.join(__dirname, "../tmp");

// Konfiguracja `multer` do przechowywania plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only .jpg and .png files are allowed"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
