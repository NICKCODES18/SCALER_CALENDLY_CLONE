const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

const authenticate = (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

/** @deprecated Use authenticate + real JWT */
const fakeAuth = (req, res, next) => {
  req.user = { id: "1" };
  next();
};

/** No JWT: fixed host user (matches assignment “default user logged in”). */
function defaultUserOrAuth(req, res, next) {
  if (process.env.USE_DEFAULT_USER === "true") {
    req.user = {
      id: process.env.DEFAULT_USER_ID || "1",
      email: process.env.DEFAULT_USER_EMAIL || "demo@calendly.local"
    };
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, fakeAuth, getToken, defaultUserOrAuth };
