const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"], // Walidacja poprawności emaila
    },

    phone: {
      type: String,
      match: [/^\+?[0-9\s\-()]{7,15}$/, "Please provide a valid phone number"], // Walidacja poprawności numeru
    },

    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// czy kontakt jest ulubiony
contactSchema.methods.isFavorite = function () {
  return this.favorite;
};

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
