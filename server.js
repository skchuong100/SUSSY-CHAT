// getting the express library
const express = require('express')
// creating an express object
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require("fs");
const os = require('os');
const username = os.userInfo().username;
const amalgamation = require('./amalgamation.js'); // import the amalgamation.js file into server.js
const am = new amalgamation(); // create instance of amalgamation class so that we can use its encryption functions.

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

// array to contain all the rooms we have at the moment
const rooms = {};

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
    // checking if the checkbox is clicked
    if (req.body.roomEncryptionRequired === 'on') {
        let encryptionKeyRoom = am.KeyGen() // generate a private Key for the room to represent the room is encrypted.
        rooms[req.body.room] = { encryptionKeyRoom: encryptionKeyRoom, users: {}, count: 0 } // case where room is encrypted with an encryption key field.
        //io.emit('download', am.KeyGen())
    } else {
        // create a room object where key: name of room value: users in room
        rooms[req.body.room] = { users: {}, count: 0 } // case where the room is normal and has no encryption field. 
    }
    // redirect person to the room they just created
    res.redirect(req.body.room)
    // Send info to client side for new room
    io.emit('room-created', rooms[req.body.room])
})


// person going a room
app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/') //redirect back home if the room field has not been filled.
    }
    res.render('room', { roomName: req.params.room }) //render the screen of the room back to the user as HTML.
    /*
    if (rooms[req.params.room].encryptionKeyRoom) {
      let userExistingRoomKey = am.KeyGen()
    }
    */
});

function download(res, userExistingRoomKey) {
    fs.writeFile('keyDownload.txt', userExistingRoomKey, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error generating file');
        }

        // Download the private key file
        res.download('keyDownload.txt', 'privateKey.txt', function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error downloading file');
            }

            // Delete the temporary file
        });
    });
}

/*
function writeFile(fileName, encryptionKey, count){
  fs.writeFile(fileName, encryptionKey, { flag: "wx" }, function (err) {
    if (err) {
      fileName = `privateKey(${count++})`
      writeFile(`C:/Users/${username}/Downloads/${fileName}.ppk`, encryptionKey, count++) //recursion to keep checking next availiable file name in someones directory.
    } else {
      //console.log('The file has been saved to the Downloads directory.')
    }
  })
}
*/

// listening on port 3000
server.listen(3000)
let userDownloaded = {}

// waiting for a connection between client and server to be made
io.on('connection', socket => {
    // waiting for new user request from client
    socket.on('new-user', (room, name) => {
        // built-in function to join room we want
        rooms[room].count += 1 //increment users in a room by 1 
        if (rooms[room].encryptionKeyRoom) {
            if (!userDownloaded[socket.id]) { // Check if download event has not been emitted for this user
                io.to(socket.id).emit('download', am.KeyGen(), room, name); // Emit the event only to this user
                userDownloaded[socket.id] = true; // Set the flag to indicate that the download event has been emitted for this user
            }
        }
        socket.join(room)
        // socket.id is unique id given by socket, we assign the key: socket.id and value to be the name of the user

        rooms[room].users[socket.id] = { name: name, decryptedPeople: [] } //create a user that has a name and list of decryptedPeople
        socket.to(room).broadcast.emit('user-connected', name) //broadcast message to everyone in room that you joined.
    })
    // waitin for a send-chat-message function call with room, message data
    socket.on('send-chat-message', (room, message) => {
        // emit to the room we are currently with the function chat-message with the following data
        if (rooms[room].encryptionKeyRoom) {
            if (!rooms[room].users[socket.id].encryptionKeyUser) {
                socket.emit('chat-message', { message: 'WARNING - cannot send messages yet as you have not uploaded your ppk', name: 'Room Disclaimer' })
                return; //when user tries to send messages without ppk, they will be given a warning that they must upload it in order to talk.
            }
            const decryptedUsers = rooms[room].users[socket.id].decryptedPeople //list of people that uploaded your ppk
            let encryptedMessage = am.encryption(message, rooms[room].users[socket.id].encryptionKeyUser) //messages are encrypted by default.
            let userSockets = Object.keys(rooms[room].users) //get the socket id of each user in a room
            const nonDecryptedSockets = userSockets.filter(sock => !decryptedUsers.includes(sock)); //filter those that are in the room but didn't upload your ppk.
            decryptedUsers.forEach(sock => {
                socket.to(sock).emit('chat-message', { message: am.decryption(message, encryptedMessage, rooms[room].users[socket.id].encryptionKeyUser), name: rooms[room].users[socket.id].name })
            }); // decrypt the messages for those that have uploaded your ppk.
            nonDecryptedSockets.forEach(sock => {
                socket.to(sock).broadcast.emit('chat-message', { message: encryptedMessage, name: rooms[room].users[socket.id].name })
            }); // send your message as encrypted to those who haven't uploaded your ppk/
        } else {
            socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id].name }) //submit normal messages to unencrypted chatroom
        }
    })
    // waiting for the disconnect
    socket.on('disconnect', () => {

        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id].name) // message to everyone that user left the room.
            delete rooms[room].users[socket.id] //delete the user object from the room
            rooms[room].count -= 1 //decrement user count in a room by 1
            if (rooms[room].count === 0) { //check if room is empty
                delete rooms[room]; //if it is, then delete the room object.
            }
        })
    })
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names // return the names of all the rooms and the users within them
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
            console.log("Error reading file: ", err) //file could not be uploaded
        }

        const fileContents = data.toString() //return contents as a string
        if (rooms[req.body.roomName].users[req.body.userId].encryptionKeyUser) {
            const roomUsers = Object.values(rooms[req.body.roomName].users) //get values of all the users
            roomUsers.forEach(user => {
                // Check if the user's name matches a specific value
                if (user.encryptionKeyUser === fileContents) {
                    if (fileContents === rooms[req.body.roomName].users[req.body.userId].encryptionKeyUser) {
                        return; //exit when user tries to add themselves to their own encryptionKeyUser field.
                    }
                    const userId = req.body.userId
                    const users = rooms[req.body.roomName].users
                    const userKey = Object.keys(users).find(key => users[key] === users[userId]) //matches users to the userID
                    user.decryptedPeople.push(userKey) //push yourself to someone else's decryptedPeople field so that when it loops through, you will recieve the decrypted messages.
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