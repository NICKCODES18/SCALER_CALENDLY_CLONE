require("dotenv").config();
const app = require("./src/app");

const PORT = parseInt(String(process.env.PORT || "5000").trim(), 10) || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  const addr = server.address();
  const p = typeof addr === "object" && addr ? addr.port : PORT;
  console.log(`Server listening on http://127.0.0.1:${p}`);
  console.log(`Health: GET http://127.0.0.1:${p}/api/health  or  /health`);
  console.log(`Auth:   POST http://127.0.0.1:${p}/api/auth/dev-login`);
});

server.on("error", (err) => {
  console.error("Failed to start server:", err.message);
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Another app (or old node) is bound there.`,
    );
    console.error("Windows: netstat -ano | findstr :" + PORT + "  then taskkill /PID <pid> /F");
  }
  process.exit(1);
});
