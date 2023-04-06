const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require('fs')

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

// implement the key
const rooms = { thisRoomIsEncrypted: { encryptionKeyRoom: 0000000000, users: {} } } // array to contain all the rooms we have at the moment

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
  //console.log(req.body.check)
  //request is an object
  //and the body is a domain. (pertaining to req.body)
  if(req.body.check === 'on'){
    encryptKey = 'pretend this is a public key........'
    const a = fs.writeFile('Output.txt', encryptData, (err) =>{
      if(err) throw err 
    })
    rooms[req.body.room] = { rncryptionKeyRoom : encryptKey,users: {} }
    io.emit('download', a)
  }
  // gonna have to modify to have encryption
  // create a room object where key: name of room value: users in room
  rooms[req.body.room] = { users: {encryptionKeyUser: 0000000000000000000000} }
  //console.log(req.body.room)
  // redirect person to the room they just created
  res.redirect(req.body.room)
  // Send info to client side for new room
  io.emit('room-created', rooms[req.body.room].encryptionKeyRoom)
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
    rooms[room].users[encryptionKeyUser] = encryptKey
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