const HTTPS_PORT = 8443; //default port for https is 443
const HTTP_PORT = 8001; //default port for http is 80
var express = require('express');
var app = express();
const exphbs = require('express-handlebars'); //to use handlebars with express
const bodyParser = require('body-parser');//parse the request body for authentication

const fs = require('fs');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;


const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------
app.engine('handlebars',exphbs({defaultLayout : 'main'}));//express engine, layout=main.handlebars
app.set('view engine','handlebars');//engine is viewed as handlebars
app.use(bodyParser.urlencoded({ extended: true })); //parse url request
app.use(bodyParser.json())//parse json requests
app.use("/static", express.static('./static/'));//used to access webrtc.js file in static folder
require('./routes/index')(app);//used to access index.js in routes //no need, all elements are included here


const httpsServer = https.createServer(serverConfig, app);
httpsServer.listen(HTTPS_PORT);

// ----------------------------------------------------------------------------------------
masterN = [];
mastername = [];
details = [];
clients = [];
room = ['abc','def','123'];
for (var i=0; i<room.length; i++){
  var client = new Array();
  var detail = new Array();
  var masterNN = new Array();
  var masternamee = new Array();
  masterN[i] = masterNN
  mastername[i] = masternamee
  details[i] = detail
  clients[i] = client } //creating 2D array of clients for all the rooms

  emptyclient = clients;
  roomUsed = []; 
  roomUnused = [];
  roomOccupied = [];
  roomAvail = room; // initially, all rooms are available


///-----------------------------------------------------------------------
// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpsServer });

wss.on('connection', function (ws) { //connection established
  ws.on('message', function (message) {
   recv = JSON.parse(message) 

   // for deleting the disconnected peer from client room detail
   if(recv.status == 'close'){ //if status is closed 

  console.log("details length", details) // left out peers
    for (var j=0; j<room.length; j++){//search for the room joined
     if(recv.roomjoined == room[j]){ // finding room joined in room array
      const index = roomUsed.indexOf(recv.roomjoined); //find the index of room
      if (index > -1) {
          roomUsed.splice(index, 1);  //remove the index value and shift array by 1
          roomOccupied = removeDuplicateRoom(roomUsed) //for finding room occupied
          console.log(roomOccupied, "roomoccupied");
          for(var i=0; i<details.length; i++){ //for removing client
            if(recv.uuid == details[index][i]){ //details array include uuid of all connected clients
              const index2 = details[index].indexOf(recv.uuid); //find index
              if (index2 > -1) {
                  details[index].splice(index2, 1); //remove uuid of user with closed status 
                clients[index].splice(index2, 1);    }//remove ws info of user with closed status
      } }//for loop 
      }
    }}
  }  // recv.status ==close
else if(recv.roomID == 'joined'){ //if person is already joined, 

    for (var i=0; i<room.length; i++){//search for the room joined by the client
    if(recv.roomjoined == room[i]){ //

        if(details[i][0]==recv.uuid){  // if master is accessing
          wss.masterbroadcast(message, i) // broadcast master feed to everyone
          
            if(recv.request == 'allow'){// allow request by master
              for (var j=0; j<details[i].length; j++){ 
                if(details[i][j]==recv.reqstudent){ //find the request's client room number
                console.log("allow req called");
               // wss.allowbroadcast(i,j);  // allowed to be broadcasted to all clients  
                wss.allowbroadcast(recv.reqstudentname,recv.reqstudent,i,j)  //master allow client's request
    
          } } }
          if(recv.request == 'cancelmaster'){ // if master presses cancel bbutton
            for (var j=0; j<details[i].length; j++){
              if(details[i][j]==recv.reqstudent){ //find request from client's room 
                  wss.cancelbroadcast(j,recv.request,recv.displayName,recv.reqstudent,recv.reqstudentname,i);//send cancel message to requested client    
                  wss.cancelbroadcast(0,recv.request,recv.displayName,recv.reqstudent,recv.reqstudentname,i); //send cancel message to master
                }  } }

    } else{ //for student, everyone except master
      if(recv.request == 'doubt'){ //if doubt request is received from client
        wss.doubtbroadcast(message, recv.request,recv.displayName, recv.uuid,i) //send this doubt message to master
        }
      else if(recv.request == 'cancelstudent'){ //if client presses the cancel button
        for (var j=0; j<details[i].length; j++){
          if(details[i][j]==recv.reqstudent){ //find client's room 
                wss.cancelallbroadcast(message,i,j);   
                //wss.studentbroadcast(message,i); 
                } } 
        }
        else{
          wss.studentbroadcast(message,i)  } //student broadcast to master
       } } //if  
      } //for
    } //if room joined
  
  else{ // for first time joining the client
    ws.room = recv.roomID //received room id of client
    for (var i=0; i<room.length; i++){ //search for that room
      if(room[i] == ws.room) { //when room found
        roomUsed.push(room[i]) //push in room used
        clients[i].push(ws) //push clients in 2d array, with roomid
        details[i].push(recv.uuid) // push client uuid in details
        details[i] = removeDuplicateRoom(details[i]) //**************
        clients[i] = removeDuplicateRoom(clients[i])
        roomOccupied = removeDuplicateRoom(roomUsed) //for finding room occupied
        console.log("room occupied",roomOccupied)

        if(details[i][0]==recv.uuid){ // for first time joining the master
          masterN[i].push(recv.displayName)
          mastername[i] = removeDuplicateRoom(masterN[i]) 
          wss.masterdetailbroadcast(i) //broadcast master detail to every client
          wss.masterbroadcast(message, i) // broadcast master message to everyone
           }
          else{
          wss.studentbroadcast(message,i) } //for first time joining the student
        //wss.trybroadcast(message,i);
           } break; 
  }     
}  

roomAvailable(room,roomOccupied,roomUnused); //find the available rooms
roomAvail = roomUnused; // for sending it to client to create room
console.log("room available", roomAvail); 
roomUnused = []; //empty it to push available rooms again
});
  ws.on('error', () => ws.terminate()); // if any error, terminate the websocket
});

//-------------------------------------------------------------------

////-------sending master details to client
wss.masterdetailbroadcast = function(roomnumber) { //send roomnumber(i) for clients to join
  for(var i in clients[roomnumber]) {
    clients[roomnumber][i].send(JSON.stringify({'mastername':mastername[roomnumber][0],'master':details[roomnumber][0]})); //send data to all clients in room
} }

///------- broadcasting to clients in room
wss.masterbroadcast = function(data,roomnumber) { //send roomnumber(i) for clients to join
  for(var i in clients[roomnumber]) {
        clients[roomnumber][i].send(data); //send data from master to all clients in room
    } }

/*
wss.allowbroadcast = function(roomnumber,clientnumber) {
  for (i=0;i<clients[roomnumber].length;i++){
    if( i == clientnumber){
      clients[roomnumber][clientnumber].send(JSON.stringify( {"request": 'allowed'})) ; //send allow message to the client who requested
  }
  if( i == 0){
    clients[roomnumber][0].send(JSON.stringify( {"request": 'allowed'})) ; //send allow message to the client who requested
}
serverConnection.send(JSON.stringify({'displayName':localDisplayName, 'uuid': localUuid, 'dest': "all", 'roomID': localRoom, 'request':'allowed' }) );
console.log("sent to server dest all")
} }

wss.allowedbroadcast = function(data,roomnumber) {
  console.log("allowed broadcast");
  for(var i in clients[roomnumber]) {
  clients[roomnumber][i].send(data); }}
 */
//---------------------allowing doubt request to send it to everyone
wss.allowbroadcast = function(reqstudentname,reqstudent,roomnumber,clientnumber) { //master allow client's request
  
      for (i=1;i<clients[roomnumber].length;i++){
        if( i == clientnumber){
          clients[roomnumber][clientnumber].send(JSON.stringify( {"request": 'allowed'})) ; //send allow message to the client who requested
          clients[roomnumber][i].send (JSON.stringify({ 'displayName': reqstudentname, 'uuid': 'reqstudent','roomID' : 'joined',' roomjoined':room[roomnumber], 'request':'allowed', 'reqstudent': reqstudent, "reqstudentname": reqstudentname  }));
          console.log('allowrbroadcast sent');
        } else{
          clients[roomnumber][clientnumber].send(JSON.stringify( {"request": 'allowed'})) ; //send allow message to the client who requested
          
        // console.log('allowrbroadcast sent');  
        // clients[roomnumber][i].send (JSON.stringify({ 'displayName': reqstudentname, 'uuid': 'reqstudent','roomID' : 'joined',' roomjoined':room[roomnumber], 'request':'allow', 'reqstudent': reqstudent, "reqstudentname": reqstudentname  }));
         //send data to all clients in room
          }  } }

  
///-----------------student broadcast sending it to master only
 wss.studentbroadcast = function(data,roomnumber) { //send roomnumber(i) for clients to join
         clients[roomnumber][0].send(data); //send data to master, 0th index    
  }

  //-----------------doubt broadcast coming from client who has doubt, and going to master
 wss.doubtbroadcast = function(data,requested,displayName,uuid,roomnumber) { //send roomnumber(i) for clients to join 
    console.log("doubt req sent, req student,",requested,displayName,roomnumber,uuid) 
      clients[roomnumber][0].send(JSON.stringify({'request' : requested ,'displayName' : displayName, 'reqstudent':uuid, 'reqstudentname':displayName,'roomNumber' : roomnumber, 'roomID':'joined', 'roomjoined' : room[roomnumber]})); 
 }

//------------cancelling the doubt request if master presses cancel button
  wss.cancelbroadcast = function(detailposition,requested,displayName,uuid,reqstudentname, roomnumber) { //send roomnumber(i) for clients to join 
        clients[roomnumber][detailposition].send(JSON.stringify({'request' : requested ,'displayName' : displayName, 'reqstudent':uuid, 'reqstudentname':reqstudentname,'roomNumber' : roomnumber, 'roomID':'joined', 'roomjoined' : room[roomnumber]})); 
  }

  //----------------- cancelling the doubt stream after getting allowed, when requested client presses cancel button
 wss.cancelallbroadcast = function(data, roomnumber, clientnumber){
   //for(var i in clients[roomnumber]) {
    for (i=1;i<clients[roomnumber].length;i++){
      if( i != clientnumber){
    console.log('cancelallbroadcast sent');  
           clients[roomnumber][i].send(data);
   } 
   if( i == 0){
     
   }
  } }
    
////-----------------------------------------------------------------------

 ////-------- room available
roomAvailable = function(array1,array2,array3){ // 1 = available, 2 = rooms in server, 3 = room in use
  for(var i = 0; i < array1.length; i++){
      var found = false;
      for(var j = 0; j < array2.length; j++){ // j < is missed;
       if(array1[i] == array2[j]){
        found = true;
        break; }
     }
     if(found == false){ // find the uncommon elements from all rooms and room used
     array3.push(array1[i]);} //push those elements in available rooms
  }
 }
 /////------for removing duplicate rooms 
 removeDuplicateRoom = function(room){
   var array = room; //rooms in server
   var outputArray = [];
   var count = 0;
   var start = false;
   for (j = 0; j < array.length; j++) { 
     for (k = 0; k < outputArray.length; k++) { 
         if ( array[j] == outputArray[k] ) { 
             start = true; } 
     } 
     count++; 
     if (count == 1 && start == false) { 
         outputArray.push(array[j]); } //push unique elemnets in the outputarray
     start = false; 
     count = 0; } 
 room = outputArray;
 return room;
 }
 //--------------------------------------------
console.log('Server running.');


