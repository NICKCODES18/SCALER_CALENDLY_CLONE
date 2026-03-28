const express = require("express");
const { googleAuth, logout } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/google", googleAuth);
router.post("/logout", logout);

module.exports = router;
