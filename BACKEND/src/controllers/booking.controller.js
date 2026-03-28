const { prisma } = require("../config/db");
const {
  parseCivilDateString,
  computeFreeSlots,
  resolveAsOfDate
} = require("../utils/bookingSlots");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const createBooking = async (req, res) => {
  try {
    const { name, email, date: rawDate, startTime: rawStart, endTime: rawEnd, eventTypeId } = req.body;
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const date = typeof rawDate === "string" ? rawDate.trim() : "";
    const startTime = typeof rawStart === "string" ? rawStart.trim() : "";
    const endTime = typeof rawEnd === "string" ? rawEnd.trim() : "";

    if (!trimmedName || !trimmedEmail || !date || !startTime || !endTime || !eventTypeId) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (!parseCivilDateString(date)) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
      return res.status(400).json({ message: "Invalid time format" });
    }

    try {
      const booking = await prisma.$transaction(async (tx) => {
        const result = await computeFreeSlots(tx, eventTypeId, date);
        if (result.error === "EVENT_TYPE_NOT_FOUND") {
          const err = new Error("EVENT_TYPE_NOT_FOUND");
          err.code = "EVENT_TYPE_NOT_FOUND";
          throw err;
        }
        if (result.error === "INVALID_DATE") {
          const err = new Error("INVALID_DATE");
          err.code = "INVALID_DATE";
          throw err;
        }

        const valid = result.slots.find(
          (s) => s.startTime === startTime && s.endTime === endTime
        );
        if (!valid) {
          const err = new Error("INVALID_SLOT");
          err.code = "INVALID_SLOT";
          throw err;
        }

        return tx.booking.create({
          data: {
            name: trimmedName,
            email: trimmedEmail,
            date,
            startTime,
            endTime,
            eventTypeId: Number(eventTypeId)
          }
        });
      });

      return res.status(201).json(booking);
    } catch (e) {
      if (e.code === "P2002") {
        return res.status(409).json({ message: "Slot already booked" });
      }
      if (e.code === "EVENT_TYPE_NOT_FOUND") {
        return res.status(404).json({ message: "Event type not found" });
      }
      if (e.code === "INVALID_SLOT") {
        return res.status(400).json({ message: "Invalid or unavailable time slot" });
      }
      if (e.code === "INVALID_DATE") {
        return res.status(400).json({ message: "Invalid date" });
      }
      throw e;
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getUpcoming = async (req, res) => {
  try {
    const today = resolveAsOfDate(req);
    const data = await prisma.booking.findMany({
      where: {
        status: "scheduled",
        date: { gte: today },
        eventType: { userId: req.user.id }
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }]
    });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getPast = async (req, res) => {
  try {
    const today = resolveAsOfDate(req);
    const data = await prisma.booking.findMany({
      where: {
        eventType: { userId: req.user.id },
        OR: [{ date: { lt: today } }, { status: "cancelled" }]
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }]
    });

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { eventType: true }
    });

    if (!booking || booking.eventType.userId !== req.user.id) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: { status: "cancelled" }
    });

    return res.json({ message: "Cancelled" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { eventType: true }
    });

    if (!booking || booking.eventType.userId !== req.user.id) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      eventTypeId: booking.eventTypeId
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getSlots = async (req, res) => {
  try {
    const eventTypeId = req.query.eventTypeId;
    const date = typeof req.query.date === "string" ? req.query.date.trim() : "";
    const guestTimeZone =
      typeof req.query.guestTimeZone === "string" ? req.query.guestTimeZone.trim() : "";
    if (!eventTypeId || !date) {
      return res.status(400).json({ message: "eventTypeId and date are required" });
    }

    const result = await computeFreeSlots(prisma, eventTypeId, date, { guestTimeZone });
    if (result.error === "EVENT_TYPE_NOT_FOUND") {
      return res.status(404).json({ message: "Event type not found" });
    }
    if (result.error === "INVALID_DATE") {
      return res.status(400).json({ message: "Invalid date format" });
    }

    return res.json(result.slots);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBooking,
  getUpcoming,
  getPast,
  cancelBooking,
  getSlots,
  getBookingById
};
