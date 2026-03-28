const express = require("express");
const {
  createEventType,
  getEventTypes,
  getBySlug,
  updateEventType,
  deleteEventType
} = require("../controllers/eventType.controller");

const { defaultUserOrAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/slug/:slug", getBySlug);
router.get("/", defaultUserOrAuth, getEventTypes);
router.post("/", defaultUserOrAuth, createEventType);
router.patch("/:id", defaultUserOrAuth, updateEventType);
router.delete("/:id", defaultUserOrAuth, deleteEventType);

module.exports = router;