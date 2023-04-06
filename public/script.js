const socket = io('http://localhost:3000')
// container for for where the messages go
const messageContainer = document.getElementById('message-container')
// container for where the new rooms are displayed
const roomContainer = document.getElementById('room-container')
// form where the person types out their messages
const messageForm = document.getElementById('send-container')
// the actual message element from the room.ejs file
const messageInput = document.getElementById('message-input')

// checking if the user has messageForm loaded, if not ask the user to input name
if (messageForm != null) {

  const name = prompt('What is your name?')
  appendMessage('You joined')
  // sending to server side to call new-user function with the following params
  socket.emit('new-user', roomName, name)

  // litesning for event to submit
  messageForm.addEventListener('submit', e => {
    // preventing the webpage from reloading
    e.preventDefault()
    // get the message
    const message = messageInput.value
    // appending the message to OUR side
    appendMessage(`You: ${message}`)
    // sending info to the server side with the functin wanted
    socket.emit('send-chat-message', roomName, message)
    // reset the message textbox
    messageInput.value = ''
  })
}

// waiting for the room creating function to be called
socket.on('room-created', room => {
  // creating a div element
  const roomElement = document.createElement('div')
  // insertingt he room name inside the innertext
  roomElement.innerText = room
  // creating an achor tag
  const roomLink = document.createElement('a')
  // inserting the linking to the room that you just created
  roomLink.href = `/${room}`
  // adding join to the inner text (this gets overwritten in the hmtl)
  roomLink.innerText = 'join'
  // appending the elements to the needed spots
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
  console.log(room)
})

socket.on('chat-message', data => {
  // appending the message to the DOM
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})


socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

socket.on('download', url => {
  download(url)
})

// adding message to the message container
function appendMessage(message) {
  // creating new div
  const messageElement = document.createElement('div')
  // changing the inner text of the div to be the message
  messageElement.innerText = message
  // appending the message div to the message container
  messageContainer.append(messageElement)
}



// trying to upload file here:
const form = document.getElementById('file-upload-form')
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  formData.append('roomName', roomName)
  formData.append('userId', socket.id)
  fetch("/upload", {
    method: 'POST',
    body: formData
  })
    .then((response) => {
      if (response.ok) {
        console.log("File upload okay")
      } else {
        console.log("failed upload")
      }
    })
    .catch((error) => {
      console.log("error uploading file: ", error)
    })
})
