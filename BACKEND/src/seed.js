require("dotenv").config();
const { prisma } = require("./config/db");

async function seed() {
  const userId = process.env.DEFAULT_USER_ID || "1";
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: process.env.DEFAULT_USER_EMAIL || "demo@calendly.local",
      name: "Nikunj Jain",
      timeZone: process.env.DEFAULT_USER_TIMEZONE || "America/New_York",
    },
    update: {
      email: process.env.DEFAULT_USER_EMAIL || "demo@calendly.local",
      name: "Nikunj Jain",
    },
  });

  const existing = await prisma.eventType.findMany({ where: { userId } });
  if (existing.length) {
    console.log("Seed skipped: event types already exist for user", userId);
    return;
  }

  const eventTypes = await prisma.$transaction(async (tx) => {
    const created = [];
    const templates = [
      { title: "30 Minute Meeting", duration: 30, slug: "30-minute-meeting" },
      { title: "60 Minute Interview", duration: 60, slug: "60-minute-interview" },
      { title: "15 Minute Intro Call", duration: 15, slug: "15-minute-intro" },
    ];

    for (const template of templates) {
      const eventType = await tx.eventType.create({
        data: {
          ...template,
          userId,
        },
      });
      created.push(eventType);
    }

    return created;
  });

  for (const eventType of eventTypes) {
    await prisma.availability.createMany({
      data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        eventTypeId: eventType.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
      })),
    });
  }

  const today = new Date();
  const upcomingDate = new Date(today);
  upcomingDate.setDate(today.getDate() + 2);
  const upcomingDate2 = new Date(today);
  upcomingDate2.setDate(today.getDate() + 5);
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 3);

  await prisma.booking.createMany({
    data: [
      {
        name: "Jordan Lee",
        email: "jordan@example.com",
        date: upcomingDate.toISOString().split("T")[0],
        startTime: "10:00",
        endTime: "10:30",
        eventTypeId: eventTypes[0].id,
      },
      {
        name: "Sam Rivera",
        email: "sam@example.com",
        date: upcomingDate2.toISOString().split("T")[0],
        startTime: "14:00",
        endTime: "15:00",
        eventTypeId: eventTypes[1].id,
      },
      {
        name: "Taylor Kim",
        email: "taylor@example.com",
        date: pastDate.toISOString().split("T")[0],
        startTime: "11:00",
        endTime: "11:30",
        eventTypeId: eventTypes[0].id,
        status: "cancelled",
      },
    ],
  });

  console.log("Seed completed: 3 event types, weekday availability, sample meetings.");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
