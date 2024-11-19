const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
});

const favoriteSchema = Joi.object({
  favorite: Joi.boolean().required(), // Tylko pole favorite jest wymagane
});

const validateContact = (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateFavorite = (req, res, next) => {
  const { error } = favoriteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = {
  contactSchema,
  favoriteSchema,
  validateContact,
  validateFavorite,
};
