const WS_PORT = 8443; //make sure this matches the port for the webscokets server
var arr = [];
var localUuid;
var localDisplayName;
var localStream;
var serverConnection;
var peerConnections = {}; // key is uuid, values are peer connection object and user defined display name string
var count=0;
var peerConnectionConfig = {
  'iceServers': [
    { 'urls': 'stun:stun.stunprotocol.org:3478' },
    { 'urls': 'stun:stun.l.google.com:19302' },
  ]  };

  reqstudentname = [];
  clientRequest = [];
  requestAllowed = [];
  reqname = [];
  master = [];
  //------------------------------------------------------------
//-------first ever function to start
function start() {

  localUuid = createUUID();
  // check if "&displayName=xxx" is appended to URL, otherwise alert user to populate
  var urlParams = new URLSearchParams(window.location.search);
  localDisplayName = urlParams.get('displayName') || prompt('Enter your name', '');
  document.getElementById('localVideoContainer').appendChild(makeLabel(localDisplayName));
  localRoom =  prompt('Enter room', '');
// video audio details
  var constraints = {
    video: { width: {max: 320},  height: {max: 240}, frameRate: {max: 30},
    }, audio: true,
  };
  // set up local video stream
  if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        localStream = stream;
        document.getElementById('localVideo').srcObject = stream;
      }).catch(errorHandler)
      // set up websocket and message all existing clients
      .then(() => {
        serverConnection = new WebSocket('wss://' + window.location.hostname + ':' + WS_PORT);
        serverConnection.onmessage = gotMessageFromServer;
        serverConnection.onopen = event => {
        serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': 'all','roomID' : localRoom }))  
       }
      window.onbeforeunload = function() {
      serverConnection.send(JSON.stringify({'uuid': localUuid,'status':'close', 'roomID' : 'left','roomjoined': localRoom }));
    }
      }).catch(errorHandler);
     } else {
    alert('Your browser does not support getUserMedia API');
  }
}

//----- when request button is pressed
function request(){
if ( localDisplayName == master[0]){ // if button is from master side
 // if(document.querySelector('#ShowButton').innerHTML == 'allow request'){ // button from master side
   serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid,'roomID' : 'joined','roomjoined': localRoom,'request':'allow','reqstudent' : clientRequest[0], "reqstudentname":reqstudentname[0] }));
  console.log("allow req destination and forr", reqstudentname[0], clientRequest[0])
 }    
  if(document.querySelector('#ShowButton').innerHTML == 'request doubt') { //if button is from client side
    document.querySelector('#text').innerHTML =  'doubt requested';//display doubt requested in every client side
    serverConnection.send(JSON.stringify({'displayName': localDisplayName,'uuid': localUuid,'request':'doubt', 'roomID' : 'joined','roomjoined': localRoom }));
    reqname.push(localDisplayName)  
  }
}

//------when cancel button is pressed
 function cancelRequest(){
    if(document.querySelector('#ShowButton').innerHTML == 'allow request'){ // cancel request from master
         console.log('cancel req function called from master',reqstudentname[0], clientRequest[0])
         serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid,'roomID' : 'joined','roomjoined': localRoom,'request':'cancelmaster','reqstudentname': reqstudentname[0],'reqstudent' : clientRequest[0]}));
    }
    if(document.querySelector('#ShowButton').innerHTML == 'request doubt') {  //cancel request from student
      if (localDisplayName == reqname[0] ){ // if client is the one who requested
       console.log('cancel req function called from student',localDisplayName, localUuid) 
       serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest' : 'all', 'roomID' : 'joined','roomjoined': localRoom,'request':'cancelstudent','reqstudentname': localDisplayName,'reqstudent' : localUuid}));
        } }
      }
  
      //----------------message from server
function gotMessageFromServer(message) {
  var signal = JSON.parse(message.data); // signal from server
  var peerUuid = signal.uuid; // saving local variable

console.log("received",signal)
  //=------ message received from wss.masterdetailbroadcast
if (signal.master){ 
  master.push(signal.mastername); } // push or save}
  if ( localDisplayName == master[0]){ // if master
  document.querySelector('#ShowButton').innerHTML = 'allow request'; // display allow request button for master side
} else{
  document.querySelector('#ShowButton').innerHTML = 'request doubt'; // display request doubt button for client side
}
if(signal.request == 'allowed'){
requestAllowed.push(signal.request)
}
//-------- message received from wss.doubtbroadcast
  if(signal.request == 'doubt'){ 
    console.log("signal request is doubt",signal.reqstudentname, signal.reqstudent) // doubt request
    reqstudentname.push(signal.displayName); // store request students name in queue
    clientRequest.push(signal.reqstudent) // store request student's uuid in queue
    document.querySelector('#text').innerHTML =  reqstudentname[0] +' has doubt'; // display to master, that student has doubt
    clientRequest = removeDuplicateRoom(clientRequest) // if button pressed multiple times by a client, remove duplication in queue
    reqstudentname = removeDuplicateRoom(reqstudentname)
  } 

// --------message received from wss.cancelbroadcast
  else if(signal.request == 'cancelmaster'){ // when cancel button is called from master side
    console.log("signal request is cancelled", signal.reqstudent)
    if(document.querySelector('#ShowButton').innerHTML == 'request doubt') { //in client side
      document.querySelector('#text').innerHTML =  'doubt request cancelled'; // display that request is cancelled
    }
    if(document.querySelector('#ShowButton').innerHTML == 'allow request'){  // in master side
      for (var i=0; i<clientRequest.length; i++){
        if(clientRequest[i] == signal.reqstudent || reqstudentname[i] == signal.reqstudentname){ // if request student matches the request in queue
          const index = clientRequest[i].indexOf(signal.reqstudent);      
          if (index > -1) {
            clientRequest.splice(index, 1);   // delete that requested client details from queue
            reqstudentname.splice(index,1);}   // delete requested client name from queue
            if(reqstudentname.length == 0){ // if no doubt left
              console.log("no doubt") 
              document.querySelector('#text').innerHTML =  'doubt'; // back to original doubt
          }else{
              console.log("next doubt") // if there are more doubts in the queue
              document.querySelector('#text').innerHTML =  reqstudentname[0] +' has doubt'; //display next doubt
            }
        
          }}} }

     //----------- message received from wss.cancelstudent
    else if(signal.request == 'cancelstudent'){  
      console.log("cancelstudent")
            if(localUuid == signal.reqstudent){ // for the requested client
              document.querySelector('#text').innerHTML =  'doubt'; // get back to original doubt
            console.log("req studeny stde", signal.reqstudent)
            requestAllowed = [];
            }else if(localDisplayName == master[0]){ // in master side
              console.log("master side", master[0])
              clientRequest = removeDuplicateRoom(clientRequest) 
              reqstudentname = removeDuplicateRoom(reqstudentname) 
                clientRequest.splice(0, 1); //remove uuid of user with closed status 
                reqstudentname.splice(0, 1);  
                if(reqstudentname.length == 0){ // if no doubt left
                  console.log("no doubt") 
                  document.querySelector('#text').innerHTML =  'doubt'; // back to original doubt
                }else{
                  console.log("next doubt") // if there are more doubts in the queue
                  document.querySelector('#text').innerHTML =  reqstudentname[0] +' has doubt'; //display next doubt
                }
             } else{ // if not master value 
            peerConnections[signal.reqstudent].pc.close() // close the video from all other clients in the room, not for master
            delete peerConnections[signal.reqstudent];
            console.log("peeruuid",signal.reqstudent)
            updateLayout();
            requestAllowed = [];
            console.log('deleted') ;}
           console.log('deleted from array',signal.reqstudentname, signal.reqstudent, localRoom);  
          }


//------------------------- for setting up connection
if (peerUuid == localUuid || (signal.dest != localUuid && signal.dest != 'all')) 
return; // Ignore messages that are not for us or from ourselves
if (signal.displayName && signal.dest == 'all') {  
  console.log("signal dest all")
  setUpPeer(peerUuid, signal.displayName); // set up peer connection object for a newcomer peer
  serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': peerUuid, 'roomID' : localRoom  }));

} else if (signal.displayName && signal.dest == localUuid) {   
  setUpPeer(peerUuid, signal.displayName, true);// initiate call if we are the newcomer peer

} else if (signal.sdp) {
  peerConnections[peerUuid].pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {  
    if (signal.sdp.type == 'offer') {  // Only create answers in response to offers
      peerConnections[peerUuid].pc.createAnswer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
    } 
  }).catch(errorHandler);
} else if (signal.ice) {
  peerConnections[peerUuid].pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
}

}//got msg from peer

//-----------------setting up a new peer,
function setUpPeer(peerUuid, displayName, initCall = false) {
  peerConnections[peerUuid] = { 'displayName': displayName, 'pc': new RTCPeerConnection(peerConnectionConfig), 'roomID' : 'joined', 'roomjoined': localRoom };
  peerConnections[peerUuid].pc.onicecandidate = event => gotIceCandidate(event, peerUuid);
  peerConnections[peerUuid].pc.ontrack = event => gotRemoteStream(event, peerUuid);
  peerConnections[peerUuid].pc.oniceconnectionstatechange = event => checkPeerDisconnect(event, peerUuid);
  peerConnections[peerUuid].pc.addStream(localStream);
  if (initCall) { //check if the message is for initiating the connection 
    peerConnections[peerUuid].pc.createOffer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
  }//create offer and call function to create sdp
}

// ----------------function for ICE candidate to the remote peer through the signaling server. 

function gotIceCandidate(event, peerUuid) {
  if (event.candidate != null) {
    serverConnection.send(JSON.stringify({ 'ice': event.candidate, 'uuid': localUuid, 'dest': peerUuid ,'roomID' : 'joined', 'roomjoined': localRoom }));
  }
}

//---------function to exchange sdp
function createdDescription(description, peerUuid) {
  console.log(`got description, peer ${peerUuid}`);
  peerConnections[peerUuid].pc.setLocalDescription(description).then(function () {
    serverConnection.send(JSON.stringify({ 'sdp': peerConnections[peerUuid].pc.localDescription, 'uuid': localUuid, 'dest': peerUuid , 'roomID' : 'joined','roomjoined': localRoom }));
  }).catch(errorHandler);
}

//function to create video element and set its attributes once got the remote stream from peer
function gotRemoteStream(event, peerUuid) {
  console.log(`got remote stream, peer ${peerUuid}`);
  //assign stream to new HTML video element
  var vidElement = document.createElement('video');
  vidElement.setAttribute('autoplay', '');
  vidElement.setAttribute('muted', '');
  vidElement.srcObject = event.streams[0];

  var vidContainer = document.createElement('div');
  vidContainer.setAttribute('id', 'remoteVideo_' + peerUuid);
  
  arr.push('remoteVideo_' + peerUuid)
  if(arr[0] != arr[1]){
  vidContainer.setAttribute('class', 'videoContainer');
  vidContainer.appendChild(vidElement);
  vidContainer.appendChild(makeLabel(peerConnections[peerUuid].displayName));

  document.getElementById('videos').appendChild(vidContainer);
  count++;
  updateLayout();
}else if(arr[0] == arr[1]){
  arr=[]
}
}

// ---------function to check if peer disconnected on iceconnectionstatechange event
function checkPeerDisconnect(event, peerUuid) {
  var state = peerConnections[peerUuid].pc.iceConnectionState; //assign state the iceConnectionState of the specific peerUuid
  console.log(`connection with peer ${peerUuid} ${state}`);
  if (state === "failed" || state === "closed" || state === "disconnected") { //check if the connection is failed, closed or disconnected
    serverConnection.send(JSON.stringify({'uuid': localUuid,'status':'close', 'roomID' : 'left','roomjoined': localRoom }));
    delete peerConnections[peerUuid];//delete the peer details from the object peerConnections
    document.getElementById('videos').removeChild(document.getElementById('remoteVideo_' + peerUuid));
    updateLayout();//update the layout on deletion
  }
}

 //-------------update CSS grid based on number of diplayed videos
function updateLayout() {
  var rowHeight = '98vh';
  var colWidth = '98vw';
  var numVideos = Object.keys(peerConnections).length + 1 ; // add one to include local video
  if (numVideos > 1 && numVideos <= 4) { // 2x2 grid
    rowHeight = '48vh';
    colWidth = '48vw';
  } else if (numVideos > 4) { // 3x3 grid
    rowHeight = '32vh';
    colWidth = '32vw';
  }
  document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
  document.documentElement.style.setProperty(`--colWidth`, colWidth);
}

//-------------function to create the video label
function makeLabel(label) {
  var vidLabel = document.createElement('div');
  vidLabel.appendChild(document.createTextNode(label));
  vidLabel.setAttribute('class', 'videoLabel');
  return vidLabel;
}

// ------function to notify error
function errorHandler(error) {
  console.log(error);
}

// -----------function to create unique id for a new peer
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

/////------function for removing duplicate rooms 
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

//------------------------------------------------------