// getting required modules
const express = require("express");
const path = require("path");

// returning an express object
const app = express();

// creatting a server using the http module on express object, don't ask, don't tell
const server = require("http").createServer(app);

// initializing socket, once again, don't ask, don't tell
const io = require("socket.io")(server);

// .user() function loads to be used as middleware, the result is whats inside
app.use(express.static(path.join(__dirname + "/public")));

// this is where the magic begins, this is where we check the socket connection
io.on("connection", function (socket) {
    // this event is for a new user joining the chat, three other events, users leaves, and user sends a message
    socket.on("newuser", function (username) {
        // emit function sends a message to all the clients, differnert messages for different events
        socket.broadcast.emit("update", username + " joined the conversation");
    });
    socket.on("exituser", function (username) {
        socket.broadcast.emit("update", username + " left the conversation");
    });
    socket.on("chat", function (message) {
        socket.broadcast.emit("chat", message);
    });
});

// the port we are listening on
server.listen(3000);  