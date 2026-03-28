// Env vars are injected by Vercel dashboard in production.
// For local dev, server.js loads dotenv instead.
const app = require("../BACKEND/src/app");

module.exports = (req, res) => {
  // Vercel passes the full path (e.g. /api/me) but Express routes are
  // registered without the /api prefix (e.g. /me). Strip it here.
  req.url = req.url.replace(/^\/api/, "") || "/";
  return app(req, res);
};