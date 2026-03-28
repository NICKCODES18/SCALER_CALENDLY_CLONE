const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { DateTime } = require("luxon");
const { OAuth2Client } = require("google-auth-library");
const { prisma } = require("../config/db");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt");

function isValidIanaZone(z) {
  if (typeof z !== "string" || !z.trim()) return false;
  return DateTime.now().setZone(z.trim()).isValid;
}

function isDevLoginAllowed() {
  return process.env.ALLOW_DEV_LOGIN === "true";
}

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  return new OAuth2Client(clientId);
}

function signToken(userId, email) {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function setAuthCookie(res, token) {
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge,
    path: "/"
  });
}

function devUserIdForEmail(email) {
  return `dev-${crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex")}`;
}

/** Email/passwordless dev login — disabled unless ALLOW_DEV_LOGIN=true */
const devLogin = async (req, res) => {
  try {
    if (!isDevLoginAllowed()) {
      return res.status(403).json({ message: "Dev login is disabled" });
    }

    const { email, name } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const displayName = typeof name === "string" && name.trim() ? name.trim() : trimmed.split("@")[0];

    let user = await prisma.user.findUnique({ where: { email: trimmed } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: devUserIdForEmail(trimmed),
          email: trimmed,
          name: displayName,
          picture: null
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: displayName }
      });
    }

    const token = signToken(user.id, user.email);
    setAuthCookie(res, token);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        timeZone: user.timeZone
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Dev login failed" });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const user = await prisma.user.upsert({
      where: { id: payload.sub },
      create: {
        id: payload.sub,
        email: payload.email,
        name: payload.name || null,
        picture: payload.picture || null
      },
      update: {
        email: payload.email,
        name: payload.name || null,
        picture: payload.picture || null
      }
    });

    const token = signToken(user.id, user.email);
    setAuthCookie(res, token);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        timeZone: user.timeZone
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: err.message || "Google sign-in failed" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", { path: "/" });
  return res.json({ ok: true });
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      timeZone: user.timeZone
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const patchMe = async (req, res) => {
  try {
    const { timeZone } = req.body;
    if (timeZone === undefined) {
      return res.status(400).json({ message: "timeZone is required" });
    }
    if (!isValidIanaZone(timeZone)) {
      return res.status(400).json({ message: "Invalid IANA time zone" });
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { timeZone: timeZone.trim() }
    });
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      timeZone: user.timeZone
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { googleAuth, devLogin, logout, me, patchMe, signToken };
