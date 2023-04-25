// getting the express library
const express = require('express');
// creating an express object
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
const fs = require("fs");
const fse = require('fs-extra');
const os = require('os');
const username = os.userInfo().username;
const amalgamation = require('./amalgamation.js'); // import the amalgamation.js file into server.js
const am = new amalgamation(); // create instance of amalgamation class so that we can use its encryption functions.

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const path = require('path');

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(cors());
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/api', cors({
  origin: 'http://sussychat.com'
}));

// implement the key
const rooms = {} // array to contain all the rooms we have at the moment

// default room we are taken too
app.get('/', (req, res) => {
  // passing rooms object to ejs file (index file)
  res.render('index', { rooms: rooms })
})

// sending post request to create new room
app.post('/room', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // block checks if roomName is empty, redirects to home if so
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  // checking if the checkbox is clicked
  if (req.body.roomEncryptionRequired === 'on') {
    let encryptionKeyRoom = am.KeyGen() // generate a private Key for the room to represent the room is encrypted.
    rooms[req.body.room] = { encryptionKeyRoom: encryptionKeyRoom, users: {} } // case where room is encrypted with an encryption key field.
  } else {
    // create a room object where key: name of room value: users in room
    rooms[req.body.room] = { users: {} } // case where the room is normal and has no encryption field. 
  }
  // redirect person to the room they just created
  res.redirect(req.body.room)
  // Send info to client side for new room
  io.emit('room-created', rooms[req.body.room])
})


// person going a room
app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/') // redirect to starting page if someone doesn't enter anything in room box.
  }
  res.render('room', { roomName: req.params.room })
  if (rooms[req.params.room].encryptionKeyRoom) {
    let userExistingRoomKey = am.KeyGen() // generate a privateKey for a specific user.

    const fileName = `privateKey.ppk`;
    const downloadDir = path.join(__dirname, 'public', 'downloads', username);
    const filePath = path.join(downloadDir, fileName);
    writeFile(filePath, userExistingRoomKey, 0); // write a file to user so they can get a privateKey.
  }
})

/*
* This function will end up writing a file to your downloads file. This function is activated when someone
* joins or initially creates a room that is encrypted because they will need a file to represent their 
* privateKey as through asymmetric encryption.
*/
function writeFile(fileName, encryptionKey, count) {
  const downloadsDir = path.join(require('os').homedir(), 'Downloads');
  const filePath = path.join(downloadsDir, fileName);
  
  fs.writeFile(fileName, encryptionKey, { flag: "wx" }, function (err) {
    if (err) {
      fileName = `privateKey(${count++})`

      writeFile(path.join(downloadsDir, `${fileName}.ppk`), encryptionKey, count++); //recursion to keep checking next availiable file name in someones directory.
    } else {
      console.log('The file has been saved to the Downloads directory.')
    }
  })
}
// listening on port 3000
server.listen(3000);

// waiting for a connection between client and server to be made
io.on('connection', socket => {
  // waiting for new user request from client
  socket.on('new-user', (room, name) => {
    // built-in function to join room we want
    socket.join(room)
    // socket.id is unique id given by socket, we assign the key: socket.id and value to be the name of the user

    rooms[room].users[socket.id] = { name: name, decryptedPeople: [] }
    socket.to(room).broadcast.emit('user-connected', name)
  })
  // waitin for a send-chat-message function call with room, message data
  socket.on('send-chat-message', (room, message) => {
    // emit to the room we are currently with the function chat-message with the following data
    if (rooms[room].encryptionKeyRoom) {
      const decryptedUsers = rooms[room].users[socket.id].decryptedPeople
      let encryptedMessage = am.encryption(message, rooms[room].users[socket.id].encryptionKeyUser)
      let userSockets = Object.keys(rooms[room].users)
      const nonDecryptedSockets = userSockets.filter(sock => !decryptedUsers.includes(sock));
      decryptedUsers.forEach(sock => {
        socket.to(sock).broadcast.emit('chat-message', { message: am.decryption(message, encryptedMessage, rooms[room].users[socket.id].encryptionKeyUser), name: rooms[room].users[socket.id].name })
      });
      nonDecryptedSockets.forEach(sock => {
        socket.to(sock).broadcast.emit('chat-message', { message: encryptedMessage, name: rooms[room].users[socket.id].name })
      });
    } else {
      socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id].name })
    }
  })
  // waiting for the disconnect
  socket.on('disconnect', () => {

    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id].name)
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
  // console.log(req.body.roomName)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log("Error reading file: ", err)
    }

    const fileContents = data.toString()
    if (rooms[req.body.roomName].users[req.body.userId].encryptionKeyUser) {
      const roomUsers = Object.values(rooms[req.body.roomName].users)
      roomUsers.forEach(user => {
        // Check if the user's name matches a specific value
        if (user.encryptionKeyUser === fileContents) {
          if (fileContents === rooms[req.body.roomName].users[req.body.userId].encryptionKeyUser) {
            return; //exit when user tries to add themselves to their own encryptionKeyUser field.
          }
          const userId = req.body.userId
          const users = rooms[req.body.roomName].users
          const userKey = Object.keys(users).find(key => users[key] === users[userId])
          user.decryptedPeople.push(userKey)
        }
      });
    } else {
      rooms[req.body.roomName].users[req.body.userId].encryptionKeyUser = fileContents //base case when user doesnt have encryption key.
      //console.log(rooms[req.body.roomName].users)
      console.log(rooms[req.body.roomName])
      console.log('user didnt have encryption key')
    }
  })
});