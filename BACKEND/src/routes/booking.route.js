const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createBooking,
  getUpcoming,
  getPast,
  cancelBooking,
  getSlots,
  getBookingById
} = require("../controllers/booking.controller");
const { defaultUserOrAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Limit booking creation: 20 requests per 15 min per IP (spam / double-booking attempts)
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many booking attempts, please try again later." }
});

router.post("/", bookingLimiter, createBooking);
router.get("/upcoming", defaultUserOrAuth, getUpcoming);
router.get("/past", defaultUserOrAuth, getPast);
router.get("/slots", getSlots);
router.delete("/:id", defaultUserOrAuth, cancelBooking);
router.get("/:id", defaultUserOrAuth, getBookingById);

module.exports = router;