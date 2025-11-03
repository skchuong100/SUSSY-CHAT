const path = require("path");
const express = require("express");
const http = require("http");

// App + server
const app = express();
const server = http.createServer(app);

// Socket.IO (default path serves /socket.io/socket.io.js to the client)
const io = require("socket.io")(server, {
  // CORS left open for local dev; lock down in production as needed
  cors: { origin: "*" }
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Optional: root route serves the chat page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket handlers
io.on("connection", (socket) => {
  // Join/leave updates are plain strings for compatibility with existing UI
  socket.on("newuser", (username) => {
    socket.broadcast.emit("update", `${username} joined the conversation`);
  });

  socket.on("exituser", (username) => {
    socket.broadcast.emit("update", `${username} left the conversation`);
  });

  // Chat relay: forward payload exactly as received (string or object)
  socket.on("chat", (payload) => {
    // Avoid logging payloads, since encrypted messages may be sensitive
    socket.broadcast.emit("chat", payload);
  });
});

// Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`SUSSY CHAT server listening on http://localhost:${PORT}`);
});
