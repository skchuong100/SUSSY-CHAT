// getting the express library
const express = require('express')
// creating an express object
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require("fs");

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

// implement the key
const rooms = {} // array to contain all the rooms we have at the moment

// default room we are taken too
app.get('/', (req, res) => {
  // passing rooms object to ejs file (index file)
  res.render('index', { rooms: rooms })
})

// sending post request to create new room
app.post('/room', (req, res) => {
  // block checks if roomName is empty, redirects to home if so
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  // creating arbitrary encryption key
  let encryptionKey = "0000000000000000000000000000000";
  // checking if the checkbox is clicked
  if (req.body.roomEncryptionRequired === 'on') {
    // encrytionKey = create(); //create the key here
    const a = fs.writeFile('privateKey.txt', encryptionKey, (err) => {
      if (err) throw err;
    })

    rooms[req.body.room] = { encryptionKeyRoom: encryptionKey, users: {} }
  } else {
    // create a room object where key: name of room value: users in room
    rooms[req.body.room] = { users: {} }
  }
  // redirect person to the room they just created
  res.redirect(req.body.room)
  // Send info to client side for new room
  io.emit('room-created', req.body.room)
})


// dont udnerstasn this part as much
app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

// listening on port 3000
server.listen(3000)

// waiting for a connection between client and server to be made
io.on('connection', socket => {
  // waiting for new user request from client
  socket.on('new-user', (room, name) => {
    // built-in function to join room we want
    socket.join(room)
    // socket.id is unique id given by socket, we assign the key: socket.id and value to be the name of the user
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
  })
  // waitin for a send-chat-message function call with room, message data
  socket.on('send-chat-message', (room, message) => {
    // emit to the room we are currently with the function chat-message with the following data
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  // waiting for the disconnect
  socket.on('disconnect', () => {

    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}


// trying to get an upload
app.post('/upload', upload.single('file'), (req, res) => {
  console.log("file uploaded: ", req.file.originalname)

  // getting the contents of the file
  const filePath = req.file.path;
  console.log("file contents: ", req.file)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log("Error reading file: ", err)
    }

    const fileContents = data.toString()
    console.log(fileContents)
    console.log(req)
    // console.log(rooms)
  })
});
