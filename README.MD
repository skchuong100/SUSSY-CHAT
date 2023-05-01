--- localhost version of chat application ----


------ instructions on how to use -----------
Upon arrival, you will see the Active Rooms page in which you will see the complete list of rooms that are
available at the current moment. You can join the ones of your choosing through the blue hyperlink in which 
you will be directed that page. If you want to create a room, you can do so at the bottom and you have the option of enabling encryption for it. You will also have to give a name to the room and this room will be 
displayed as open to other users. After creating or joining a room, you will be prompted to enter a name so that others can identify you as that name. If encryption is enabled, you will have extra functionality in that it will be listed now. For starters, you will have been sent a privateKey_room_name.ppk file in which that serves as your key which will be used to have others decrypt your messages. The first step to even partake in the room is that you have to upload the ppk file that you downloaded or else you will be given a warning by the chatroom. Once you have uploaded your own ppk file, you can then start chatting but then you will notice that others cannot read your messages as they are encrypted. If others are in the room, you will see their messages as encrypted. You will then have to exchange ppks with everyone that joins the room and you do so by sending them through another third party software such as Discord, instagram, text message, etc. Once you have others' ppk's, you can upload their files to the upload button as mentioned before. You will then notice that you can see their messages but this time they are decrypted and perfectly readable. You will have to continue this exchange of ppks with new users that join the room and we did this to maintain integrity/security of users. You will also get room notifications when people join/leave the chatroom. If you create/join a chatroom without encryption, it will function as a normal chatroom where you can see messages normally. You will not recieve a ppk in this version and therefore won't have to worry about encryption/decryption.


------ how to get it to run on your machine ---------
1. In terms of getting the chatroom application to run locally, you will need to download the files that will be labeled “localhost”. 
2. Once these files are placed into a folder in a directory of your choosing, open your IDE of choice and go open that folder in your IDE. 
3. Once there, open a terminal and install node.js/npm. 
4. You will have to go to the node.js website as labeled by nodejs.org/en/download/ and you will need to download the node files under the Operating System you are using. 
5. You can verify these are installed correctly by running the commands “node -v” and “npm -v”. 
6. Socket.io is already included in our source in the .ejs files so you don’t need to worry about that. 
7. Now you can run the application locally by opening a terminal in your IDE and typing “npm run devStart”. 
8. Then you will open a browser of your choosing and you will type “localhost:3000/”. 
9. You should see the application running and now you can start to mess with the functionality included within the chatrooms.