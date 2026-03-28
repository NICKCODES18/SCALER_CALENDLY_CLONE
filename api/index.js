require("dotenv").config({ path: require("path").join(__dirname, "../BACKEND/.env") });
const app = require("../BACKEND/src/app");

module.exports = (req, res) => {
  // Vercel passes the full path (e.g. /api/me) but Express routes are
  // registered without the /api prefix (e.g. /me). Strip it here.
  req.url = req.url.replace(/^\/api/, "") || "/";
  return app(req, res);
};