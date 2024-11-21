const express = require("express");
const router = express.Router();
const {
  validateContact,
  validateFavorite,
} = require("../../middlewares/validateContact");
const {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact,
} = require("../../controllers/contactsController");

router.get("/", listContacts);
router.get("/:contactId", getContactById);
router.post("/", validateContact, addContact);
router.put("/:contactId", validateContact, updateContact);
router.patch("/:contactId/favorite", validateFavorite, updateStatusContact);
router.delete("/:contactId", removeContact);

module.exports = router;
