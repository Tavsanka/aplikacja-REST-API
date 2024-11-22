const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
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

router.get("/", authMiddleware, listContacts);
router.get("/:contactId", authMiddleware, getContactById);
router.post("/", authMiddleware, validateContact, addContact);
router.put("/:contactId", authMiddleware, validateContact, updateContact);
router.patch(
  "/:contactId/favorite",
  authMiddleware,
  validateFavorite,
  updateStatusContact
);
router.delete("/:contactId", authMiddleware, removeContact);

module.exports = router;
