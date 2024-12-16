const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false, // Domyślnie użytkownik nie jest zweryfikowany
    },
    verificationToken: {
      type: String,
      required: function () {
        return !this.verify; // Wymagane tylko wtedy, gdy pole "verify" jest ustawione na "false"
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
