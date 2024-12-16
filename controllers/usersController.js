const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
console.log("Jimp module loaded:", Jimp);

const { nanoid } = require("nanoid"); // Nanoid do generowania tokenów
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require("../models/user");

// Definiowanie ścieżki do folderu avatars
const avatarsDir = path.join(__dirname, "../public/avatars");

// Rejestracja użytkownika
const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generowanie URL awatara
    const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);

    // Generowanie tokenu weryfikacyjnego
    const verificationToken = nanoid();
    console.log("Generated verificationToken:", verificationToken);

    // Tworzenie nowego użytkownika
    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });

    // Wysyłanie emaila weryfikacyjnego
    const verificationLink = `${process.env.BASE_URL}/api/users/verify/${verificationToken}`;
    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL, // Nadawca zarejestrowany w SendGrid
      subject: "Email Verification",
      html: `<p>Thank you for registering!</p>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${verificationLink}">Verify Email</a>`,
    };

    await sgMail.send(msg);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const msg = {
      to: email,
      from: "noreply@yourapp.com",
      subject: "Please verify your email",
      html: `<p>Click <a href="http://localhost:4000/api/users/verify/${user.verificationToken}">here</a> to verify your email.</p>`,
    };

    await sgMail.send(msg);

    res.status(200).json({ message: "Verification email sent" });
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

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Pobierz aktualnego użytkownika
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Usunięcie starego pliku, jeśli istnieje
    if (currentUser.avatarURL) {
      const oldAvatarPath = path.join(
        __dirname,
        "../public",
        currentUser.avatarURL
      );
      try {
        await fs.access(oldAvatarPath);
        console.log("Plik istnieje:", oldAvatarPath);
        await fs.unlink(oldAvatarPath);
        console.log("Stare zdjęcie usunięte:", oldAvatarPath);
      } catch (unlinkError) {
        console.error(
          "Błąd podczas usuwania starego zdjęcia lub plik nie istnieje:",
          unlinkError.message
        );
      }
    }

    // Pobranie ścieżki tymczasowej i nazwy pliku
    const { path: tempPath, filename } = req.file;

    // **Dodanie logów do sprawdzenia ścieżki tymczasowej**
    console.log("Temp file path:", tempPath);

    const avatarPath = path.join(avatarsDir, `${Date.now()}-${filename}`);

    // **Dodanie logów do sprawdzenia ścieżki docelowej**
    console.log("Final avatar path:", avatarPath);

    // Przetwarzanie obrazu za pomocą Jimp
    try {
      const image = await Jimp.read(tempPath);
      console.log("Image loaded successfully");

      const maxSize = 500; // Maksymalny rozmiar dłuższego boku
      const width = image.getWidth();
      const height = image.getHeight();

      if (width > maxSize || height > maxSize) {
        const scalingFactor = maxSize / Math.max(width, height);
        const newWidth = Math.round(width * scalingFactor);
        const newHeight = Math.round(height * scalingFactor);
        await image.resize(newWidth, newHeight); // Zmniejszenie proporcjonalne
        console.log(
          `Image resized to ${newWidth}x${newHeight} before cropping`
        );
      }

      // **Krok 2: Kadrowanie do kwadratu**
      const croppedSize = Math.min(image.getWidth(), image.getHeight());
      const x = (image.getWidth() - croppedSize) / 2;
      const y = (image.getHeight() - croppedSize) / 2;

      image.crop(x, y, croppedSize, croppedSize);
      console.log(`Image cropped to ${croppedSize}x${croppedSize}`);

      // **Krok 3: Zmiana rozmiaru na 250x250**
      await image.resize(250, 250).writeAsync(tempPath);
      console.log("Image resized to 250x250 successfully");
    } catch (jimpError) {
      console.error("Error processing image with Jimp:", jimpError.message);
      return res
        .status(500)
        .json({ message: "Failed to process image with Jimp." });
    }

    // Przenieś plik do public/avatars
    try {
      await fs.rename(tempPath, avatarPath);
      console.log("File moved successfully");
    } catch (renameError) {
      console.error("Error moving file:", renameError.message);
      return res.status(500).json({ message: "Failed to move file." });
    }

    // Aktualizacja pola avatarURL w użytkowniku
    const avatarURL = `/avatars/${path.basename(avatarPath)}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatarURL },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Avatar URL updated successfully");
    res.status(200).json({ avatarURL: updatedUser.avatarURL });
  } catch (error) {
    console.error("Unexpected error in updateAvatar:", error.message);
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    console.log("Received token:", verificationToken);

    const user = await User.findOne({ verificationToken });
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
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
  updateAvatar,
  verifyEmail,
  resendVerificationEmail,
};
