function generateSlots(start, end, duration) {
  let slots = [];
  let [h, m] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);

  while (h < eh || (h === eh && m < em)) {
    let startTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    m += duration;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }

    let endTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    if (h > eh || (h === eh && m > em)) break;

    slots.push({ startTime, endTime });
  }

  return slots;
}

module.exports = { generateSlots };