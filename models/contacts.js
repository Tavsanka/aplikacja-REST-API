const Contact = require("../models/contact");

async function listContacts() {
  return await Contact.find();
}

async function getContactById(contactId) {
  return (await Contact.findById(contactId)) || null;
}

async function removeContact(contactId) {
  const contact = await Contact.findByIdAndDelete(contactId);
  return contact || null;
}

async function addContact({ name, email, phone, favorite = false }) {
  const newContact = new Contact({
    name,
    email,
    phone,
    favorite,
  });

  await newContact.save();
  return newContact;
}

async function updateContact(contactId, body) {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
    runValidators: true,
  });

  return updatedContact || null;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
