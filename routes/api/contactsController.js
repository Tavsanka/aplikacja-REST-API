const contacts = require("../../models/contacts");

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
    const userId = req.user._id;
    const contact = await Contact.findOne({
      _id: req.params.contactId,
      owner: userId,
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
    const { name, email, phone, favorite = false } = req.body;
    const userId = req.user._id;

    const newContact = await Contact.create({
      name,
      email,
      phone,
      favorite,
      owner: userId, // Ustawianie właściciela
    });

    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: userId },
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
    const userId = req.user._id;
    const contact = await Contact.findOneAndDelete({
      _id: req.params.contactId,
      owner: userId,
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
    const userId = req.user._id;
    const { contactId } = req.params;
    const { favorite } = req.body;

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: userId },
      { favorite },
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

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact,
};
