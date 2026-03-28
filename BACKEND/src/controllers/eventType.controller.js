const { prisma } = require("../config/db");

const MAX_DURATION_MINUTES = 24 * 60;

/** @param {unknown} raw @returns {number | null} */
function parseDurationMinutes(raw) {
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_DURATION_MINUTES) {
    return null;
  }
  return n;
}

function sanitizeSlug(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveSlug(bodySlug, title) {
  if (typeof bodySlug === "string" && bodySlug.trim()) {
    const s = sanitizeSlug(bodySlug);
    if (s) return s;
  }
  if (title) {
    const s = sanitizeSlug(title);
    if (s) return s;
  }
  return null;
}

// 🔥 CREATE EVENT TYPE
const createEventType = async (req, res) => {
  try {
    const { title, duration, description, slug: bodySlug } = req.body;

    if (!title || duration === undefined || duration === null) {
      return res.status(400).json({ message: "Title and duration required" });
    }

    const durationMinutes = parseDurationMinutes(duration);
    if (durationMinutes === null) {
      return res.status(400).json({
        message: `duration must be an integer from 1 to ${MAX_DURATION_MINUTES} minutes`
      });
    }

    const slug = resolveSlug(bodySlug, title);
    if (!slug) {
      return res.status(400).json({ message: "Invalid or empty slug" });
    }

    // check duplicate slug
    const exists = await prisma.eventType.findUnique({
      where: { slug }
    });

    if (exists) {
      return res.status(400).json({ message: "Event type already exists" });
    }

    // Seed a default weekday availability so newly created event types
    // are immediately bookable from the calendar UI.
    const event = await prisma.$transaction(async (tx) => {
      const createdEvent = await tx.eventType.create({
        data: {
          title,
          duration: durationMinutes,
          slug,
          description: description || "",
          userId: req.user.id
        }
      });

      const weekdays = [1, 2, 3, 4, 5];
      await tx.availability.createMany({
        data: weekdays.map((dayOfWeek) => ({
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          eventTypeId: createdEvent.id
        }))
      });

      return createdEvent;
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 GET ALL EVENT TYPES
const getEventTypes = async (req, res) => {
  try {
    const data = await prisma.eventType.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "desc" }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 GET EVENT TYPE BY SLUG (PUBLIC PAGE)
const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const data = await prisma.eventType.findUnique({
      where: { slug },
      include: {
        user: { select: { timeZone: true } },
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
        }
      }
    });

    if (!data) {
      return res.status(404).json({ message: "Event type not found" });
    }

    const { user, ...rest } = data;
    res.json({
      ...rest,
      hostTimeZone: user?.timeZone || "America/New_York"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 UPDATE EVENT TYPE
const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, description, slug: bodySlug } = req.body;

    const existing = await prisma.eventType.findFirst({
      where: { id: Number(id), userId: req.user.id }
    });
    if (!existing) {
      return res.status(404).json({ message: "Event type not found" });
    }

    let slug;
    if (typeof bodySlug === "string" && bodySlug.trim()) {
      const s = resolveSlug(bodySlug, undefined);
      if (!s) {
        return res.status(400).json({ message: "Invalid slug" });
      }
      slug = s;
    } else if (title !== undefined) {
      const s = resolveSlug(undefined, title);
      if (!s) {
        return res.status(400).json({ message: "Invalid slug" });
      }
      slug = s;
    }

    if (slug !== undefined) {
      const conflict = await prisma.eventType.findUnique({ where: { slug } });
      if (conflict && conflict.id !== Number(id)) {
        return res.status(400).json({ message: "Event slug already exists" });
      }
    }

    let durationMinutes;
    if (duration !== undefined) {
      durationMinutes = parseDurationMinutes(duration);
      if (durationMinutes === null) {
        return res.status(400).json({
          message: `duration must be an integer from 1 to ${MAX_DURATION_MINUTES} minutes`
        });
      }
    }

    const updated = await prisma.eventType.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(durationMinutes !== undefined && { duration: durationMinutes }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description })
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 DELETE EVENT TYPE
const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.eventType.findFirst({
      where: { id: Number(id), userId: req.user.id }
    });
    if (!existing) {
      return res.status(404).json({ message: "Event type not found" });
    }

    await prisma.eventType.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createEventType,
  getEventTypes,
  getBySlug,
  updateEventType,
  deleteEventType
};