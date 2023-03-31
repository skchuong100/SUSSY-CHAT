// getting required modules
const express = require("express");
const path = require("path");

// returning an express object
const app = express();

// creatting a server using the http module on express object, don't ask, don't tell
const server = require("http").createServer(app);

// initializing socket, once again, don't ask, don't tell
const io = require("socket.io")(server);

app.set('views', './views');
app.set('view engine', 'ejs');
// .user() function loads to be used as middleware, the result is whats inside
app.use(express.static(path.join(__dirname + "/public")));
app.use(express.urlencoded({ extended: true }))

const rooms = { TESTING: true, ANother: true }; // keep track of the existing rooms

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = true;
    res.redirect(req.body.room);
    io.emit('room-created', req.body.room);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomName: req.params.room })
})
// this is where the magic begins, this is where we check the socket connection
io.on("connection", function (socket) {
    // this event is for a new user joining the chat, three other events, users leaves, and user sends a message
    socket.on("newuser", function (username, room) {
        // emit function sends a message to all the clients, differnert messages for different events
        socket.join(room);
        // socket.to(room).broadcast.emit("update", username + " joined the conversation");
    });
    socket.on("exituser", function (username) {
        socket.broadcast.emit("update", username + " left the conversation");
    });
    socket.on("chat", function (message, room) {
        socket.to(room).broadcast.emit("chat", { message: message });
    });
});

// the port we are listening on
server.listen(3000);