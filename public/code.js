(function () {
    //DOM MANIPULATION

    //getting the container for the whole app
    const app = document.querySelector(".app");
    // still not sure what this does
    const socket = io();

    // local variable to hold the username
    let uname;



    // adding event listener to when join button is clicked in the joining screen
    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        // getting value of the username textbox input, stopping if empty
        let username = app.querySelector(".join-screen #username").value;
        if (username.length == 0) {
            return;
        }
        // sending message to all clients with the param of new user, look at server.js file to see where this info goes and how it is used
        socket.emit("newuser", username);
        uname = username;
        // toggling the joining screen and the chatting screen
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    // adding event listern to send button in the chat screen
    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        // getting message from the textbox, if not message is present terminate function
        let message = app.querySelector(".chat-screen #message-input").value;

        if (message.length == 0) {
            return;
        }

        // calling renderMessage function, defined below, this happens when you send a message
        renderMessage("my", {
            username: uname,
            text: message
        });

        // sending message to all clients, this is in the case someone sends a message
        socket.emit("chat", {
            username: uname,
            text: message
        });
        // reseting the textbox in the chatting screen to be empty
        app.querySelector(".chat-screen #message-input").value = "";

    });

    // adding an event lsitener to the exit button in the header of the chat screen, if clicked send message to all clients, look at
    // server.js file to know what message is sent, and then reset window back to the joining screen
    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    const roomContainer = document.getElementById('room-container');
    socket.on('room-created', room => {
        const roomElement = document.createElement('div');
        roomElement.innerText = room;
        const roomLink = document.createElement('a');
        roomLink.href = `/${room}`
        roomLink.innerText = "join"
        roomContainer.append(roomElement)
        roomContainer.append(roomLink)
    })

    socket.on("update", function (update) {
        renderMessage("update", update);
    });

    // this checks for when a message is sent from someone else other than you
    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    // block of code for when something is sent in the chat screen, there are three options, you sent a message, someone sent a message
    // or someone left/joined
    function renderMessage(type, message) {
        // getting the container where the message will be appended too
        let messageContainer = app.querySelector(".chat-screen .messages");
        if (type == "my") {
            // creating new html div element
            let el = document.createElement("div");
            // adding class attributes to div element created above
            el.setAttribute("class", "message my-message");
            // adding the html to the div element
            el.innerHTML = `
            <div>
            <div class="name">You</div>
            <div class="text"> ${message.text}</div>
            </div>
            `;
            // appending the message to the end of the container
            messageContainer.appendChild(el);
        } else if (type == "other") {
            // someone sent a message, need to update screen to show on all clients
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                <div class="name">${message.username}</div>
                <div class="text">${message.text}</div>
                </div>
                `;
            messageContainer.appendChild(el);
        } else if (type == "update") {
            // someone left, or joined
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el)
        }
        // for scrolling purposes
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})(); 