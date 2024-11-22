const Contact = require("../models/contact");

const listContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const allContacts = await Contact.find({ owner: userId });
    res.status(200).json(allContacts);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.contactId,
      owner: req.user._id,
    });
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { name, email, phone, favorite } = req.body;
    const owner = req.user._id;

    const newContact = await Contact.create({
      name,
      email,
      phone,
      favorite,
      owner,
    });

    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.contactId,
      owner: req.user._id,
    });
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const { favorite } = req.body;

    if (typeof favorite !== "boolean") {
      return res.status(400).json({ message: "Missing field favorite" });
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: req.user._id },
      { favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact,
};
