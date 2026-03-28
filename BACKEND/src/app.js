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

// Registered before any middleware so a bad proxy/CORS setup cannot hide this route.
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

/** Same port, localhost ↔ 127.0.0.1 (browsers treat them as different CORS origins). */
function expandLocalhostAliases(origins) {
  const set = new Set(origins.filter(Boolean));
  for (const o of [...set]) {
    try {
      const u = new URL(o);
      const port = u.port || (u.protocol === "https:" ? "443" : "80");
      if (u.hostname === "localhost") {
        set.add(`${u.protocol}//127.0.0.1:${port}`);
      } else if (u.hostname === "127.0.0.1") {
        set.add(`${u.protocol}//localhost:${port}`);
      }
    } catch {
      // ignore malformed URL
    }
  }
  return [...set];
}

const isProd = process.env.NODE_ENV === "production";
const rawOrigins = process.env.FRONTEND_URL || "http://localhost:5173";
let allowedOrigins = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);
if (!isProd) {
  const viteDev = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ];
  allowedOrigins = [...new Set([...allowedOrigins, ...viteDev])];
}
const corsOrigins = expandLocalhostAliases(allowedOrigins);

// Use an explicit origin list so the library echoes the request Origin (never "*") when credentials matter.
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// Registered on the app (not only the auth router) so POST is always found with Express 5.
app.post("/api/auth/dev-login", devLogin);

app.use("/api/auth", authRoutes);
app.get("/api/me", defaultUserOrAuth, me);
app.patch("/api/me", defaultUserOrAuth, patchMe);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/booking", bookingRoutes);

app.get("/", (req, res) => {
  res.send("API working");
});

module.exports = app;
