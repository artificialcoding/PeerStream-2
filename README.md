# PeerStream-2
This code uses nodeJS, ws and express

To start : 
```
$ npm install
$ npm start or node server.js
```

To run on browser:
```
https://localhost:8443
```
On the first page, click on create button to request for a room name
once room is alloted, share that room with users, and click on join button
enter your name and room name in the prompted box
_teacher will be displayed request button as : allow request
_students will be displayed request button as  : request doubt 

on pressing request doubt, details of student is sent to teacher, and stored in queue
_if teacher cancels, next request in the queue will be mentioned to him
_if teacher allows, allow message is sent to student to share his stream with everyone
_(allowrequest code to be updated, giving error in sdp exchange)

if everyone leaves the room and ends the meeting, 
_that room is availble for the allotment to new user when create room is clicked.

Right now, teacher is broadcasting his stream to everyone and students are broadcasting there data to teacher. 
This code can be merged with Multi-Client WebRTC Scalable Broadcast, for broadcasting data
["https://github.com/artificialcoding/PeerStream"](https://github.com/artificialcoding/PeerStream)
