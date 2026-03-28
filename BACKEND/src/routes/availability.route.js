const express = require("express");
const { setAvailability, getAvailability } = require("../controllers/availability.controller");
const { defaultUserOrAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", defaultUserOrAuth, setAvailability);
router.get("/:id", defaultUserOrAuth, getAvailability);

module.exports = router;