require("dotenv").config({ path: require("path").join(__dirname, "../BACKEND/.env") });
const app = require("../BACKEND/src/app");

module.exports = (req, res) => {
  return app(req, res);
};