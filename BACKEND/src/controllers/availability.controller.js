const { prisma } = require("../config/db");

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** @returns {string | null} Error message, or null if valid. */
function validateAvailabilityFields(dayOfWeek, startTime, endTime) {
  const dow = Number(dayOfWeek);
  if (!Number.isInteger(dow) || dow < 0 || dow > 6) {
    return "dayOfWeek must be an integer from 0 (Sunday) to 6 (Saturday)";
  }
  if (typeof startTime !== "string" || typeof endTime !== "string") {
    return "startTime and endTime must be strings";
  }
  const s = startTime.trim();
  const e = endTime.trim();
  if (!TIME_RE.test(s) || !TIME_RE.test(e)) {
    return "Invalid time format (expected HH:mm)";
  }
  if (timeToMinutes(s) >= timeToMinutes(e)) {
    return "startTime must be strictly before endTime";
  }
  return null;
}

async function assertEventOwnership(userId, eventTypeId) {
  const et = await prisma.eventType.findFirst({
    where: { id: Number(eventTypeId), userId }
  });
  if (!et) {
    const err = new Error("Event type not found");
    err.statusCode = 404;
    throw err;
  }
}

const setAvailability = async (req, res) => {
  try {
    const { eventTypeId, dayOfWeek, startTime, endTime, slots } = req.body;

    // Bulk replace mode for an event type.
    if (Array.isArray(slots) && eventTypeId) {
      await assertEventOwnership(req.user.id, eventTypeId);

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const errMsg = validateAvailabilityFields(slot.dayOfWeek, slot.startTime, slot.endTime);
        if (errMsg) {
          return res.status(400).json({ message: `${errMsg} (slot index ${i})` });
        }
      }

      await prisma.availability.deleteMany({
        where: { eventTypeId: Number(eventTypeId) }
      });

      if (slots.length) {
        await prisma.availability.createMany({
          data: slots.map((slot) => ({
            eventTypeId: Number(eventTypeId),
            dayOfWeek: Number(slot.dayOfWeek),
            startTime: String(slot.startTime).trim(),
            endTime: String(slot.endTime).trim()
          }))
        });
      }

      const updated = await prisma.availability.findMany({
        where: { eventTypeId: Number(eventTypeId) },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
      });

      return res.json(updated);
    }

    if (!eventTypeId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: "Invalid availability payload" });
    }

    const errMsg = validateAvailabilityFields(dayOfWeek, startTime, endTime);
    if (errMsg) {
      return res.status(400).json({ message: errMsg });
    }

    await assertEventOwnership(req.user.id, eventTypeId);

    const data = await prisma.availability.create({
      data: {
        eventTypeId: Number(eventTypeId),
        dayOfWeek: Number(dayOfWeek),
        startTime: String(startTime).trim(),
        endTime: String(endTime).trim()
      }
    });
    return res.json(data);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    await assertEventOwnership(req.user.id, req.params.id);

    const data = await prisma.availability.findMany({
      where: { eventTypeId: Number(req.params.id) },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });
    return res.json(data);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message });
  }
};

module.exports = { setAvailability, getAvailability };
