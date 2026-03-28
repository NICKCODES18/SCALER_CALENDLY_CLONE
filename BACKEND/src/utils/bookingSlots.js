const { DateTime } = require("luxon");
const { generateSlots } = require("./slotGenerator");

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_HOST_TZ = "America/New_York";

/**
 * Parse YYYY-MM-DD as a civil calendar date (no UTC shift).
 * Returns weekday 0–6 (Sun–Sat) consistent with JS Date for that calendar day.
 */
function parseCivilDateString(dateStr) {
  if (typeof dateStr !== "string" || !ISO_DATE_RE.test(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return { y, m, d, weekday: dt.getDay() };
}

/** Today's civil date in the server's local timezone (fallback when client omits asOf). */
function serverLocalTodayString() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function resolveHostTimeZone(userTimeZone) {
  if (typeof userTimeZone === "string" && userTimeZone.trim()) {
    const z = userTimeZone.trim();
    if (DateTime.now().setZone(z).isValid) return z;
  }
  return DEFAULT_HOST_TZ;
}

/**
 * Add guest-facing labels for slot times (host wall-clock on dateStr in hostZone → guestZone).
 */
function attachGuestLabels(slot, dateStr, hostZone, guestZone) {
  const hz = resolveHostTimeZone(hostZone);
  const gz = resolveHostTimeZone(guestZone);
  if (hz === gz) {
    return { ...slot, startTimeGuest: slot.startTime, endTimeGuest: slot.endTime };
  }
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h1, m1] = slot.startTime.split(":").map(Number);
  const [h2, m2] = slot.endTime.split(":").map(Number);
  const startHost = DateTime.fromObject(
    { year: y, month: mo, day: d, hour: h1, minute: m1, second: 0 },
    { zone: hz }
  );
  const endHost = DateTime.fromObject(
    { year: y, month: mo, day: d, hour: h2, minute: m2, second: 0 },
    { zone: hz }
  );
  if (!startHost.isValid || !endHost.isValid) {
    return { ...slot, startTimeGuest: slot.startTime, endTimeGuest: slot.endTime };
  }
  const guestStart = startHost.setZone(gz);
  const guestEnd = endHost.setZone(gz);
  return {
    ...slot,
    startTimeGuest: guestStart.toFormat("HH:mm"),
    endTimeGuest: guestEnd.toFormat("HH:mm")
  };
}

/**
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} prisma
 * @param {{ guestTimeZone?: string }} [options]
 */
async function computeFreeSlots(prisma, eventTypeId, dateStr, options = {}) {
  const guestTimeZone = typeof options.guestTimeZone === "string" ? options.guestTimeZone.trim() : "";
  const parsed = parseCivilDateString(dateStr);
  if (!parsed) return { error: "INVALID_DATE" };

  const eventType = await prisma.eventType.findUnique({
    where: { id: Number(eventTypeId) },
    include: { user: { select: { timeZone: true } } }
  });
  if (!eventType) return { error: "EVENT_TYPE_NOT_FOUND" };

  const hostTz = resolveHostTimeZone(eventType.user?.timeZone);

  const availability = await prisma.availability.findMany({
    where: {
      eventTypeId: Number(eventTypeId),
      dayOfWeek: parsed.weekday
    },
    orderBy: { startTime: "asc" }
  });

  if (!availability.length) {
    return { eventType, slots: [], hostTimeZone: hostTz };
  }

  let slots = availability.flatMap((entry) =>
    generateSlots(entry.startTime, entry.endTime, eventType.duration)
  );

  const seen = new Set();
  slots = slots.filter((s) => {
    if (seen.has(s.startTime)) return false;
    seen.add(s.startTime);
    return true;
  });
  slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const booked = await prisma.booking.findMany({
    where: {
      date: dateStr,
      eventTypeId: Number(eventTypeId),
      status: "scheduled"
    }
  });

  let free = slots.filter((s) => !booked.some((b) => b.startTime === s.startTime));

  if (guestTimeZone && guestTimeZone !== hostTz) {
    free = free.map((s) => attachGuestLabels(s, dateStr, hostTz, guestTimeZone));
  } else {
    free = free.map((s) => ({ ...s, startTimeGuest: s.startTime, endTimeGuest: s.endTime }));
  }

  return { eventType, slots: free, hostTimeZone: hostTz };
}

function resolveAsOfDate(req) {
  const raw = req.query?.asOf;
  if (typeof raw === "string" && ISO_DATE_RE.test(raw) && parseCivilDateString(raw)) {
    return raw;
  }
  return serverLocalTodayString();
}

module.exports = {
  ISO_DATE_RE,
  parseCivilDateString,
  computeFreeSlots,
  resolveAsOfDate,
  serverLocalTodayString,
  resolveHostTimeZone,
  DEFAULT_HOST_TZ
};
