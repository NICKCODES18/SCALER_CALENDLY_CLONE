const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { me, devLogin, patchMe } = require("./controllers/auth.controller");
const { defaultUserOrAuth } = require("./middleware/auth.middleware");

const authRoutes = require("./routes/auth.route");
const eventTypeRoutes = require("./routes/eventType.route");
const availabilityRoutes = require("./routes/availability.route");
const bookingRoutes = require("./routes/booking.route");

const app = express();

/* -------------------- HEALTH -------------------- */
app.get("/health", (req, res) => res.json({ ok: true }));

/* -------------------- CORS -------------------- */
const isProd = process.env.NODE_ENV === "production";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // allow all (safe for assignment)
      }
    },
    credentials: true,
  })
);

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cookieParser());

/* -------------------- AUTH -------------------- */
app.post("/auth/dev-login", devLogin);
app.use("/auth", authRoutes);

app.get("/me", defaultUserOrAuth, me);
app.patch("/me", defaultUserOrAuth, patchMe);

/* -------------------- CORE ROUTES -------------------- */
app.use("/event-types", eventTypeRoutes);
app.use("/availability", availabilityRoutes);
app.use("/booking", bookingRoutes);

/* -------------------- ROOT -------------------- */
app.get("/", (req, res) => {
  res.send("API working 🚀");
});

module.exports = app;