const express = require('express'); 
const app = express();
const server = app.listen(3001,console.log('Socket.io Hello Wolrd server started!'));
const io = require('socket.io')(server);
const fs = require('fs');
require('jsonminify');
//screen//node test/socketserver.js//ctrl a +d//screen -r
/*
echo "# RollPlay.io" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/fahust/RollPlay.io.git
git push -u origin master
fahust/ skisoboy999
*/


var AllRoom = require('./classObj/rooms.js'); 
var AllRoomLoaded = new AllRoom();

//READ
/*
fs.readFile('student.json', (err, data) => {
  if (err) throw err;
  var student = JSON.parse(data);
  AllRoomLoaded.loadRoomByFile(student);


});*/


fs.readFile('name.json', (err, data) => {
  if (err) throw err;
  var student = JSON.parse(data);
  student.forEach(name => {
    AllRoomLoaded.addNammeAtLoad(name.name);
  });
  var arrayDoor = [];
  arrayDoor.push('tavern');
  arrayDoor.push('adventurer\'s road');
  AllRoomLoaded.createNewRoomDev(5,0,2,5,1,1,0,'port',arrayDoor);
  arrayDoor = [];
  arrayDoor.push('port');
  AllRoomLoaded.createNewRoomDev(5,0,2,5,1,1,0,'tavern',arrayDoor);
  arrayDoor.push('port');
  arrayDoor.push('adventurer\'s cemetery');
  arrayDoor.push('adventurer\'s mountain');
  AllRoomLoaded.createNewRoomDev(2,4,1,0,1,1,2,'adventurer\'s road',arrayDoor);
  arrayDoor.push('adventurer\'s road');
  AllRoomLoaded.createNewRoomDev(2,6,1,1,1,1,3,'adventurer\'s cemetery',arrayDoor);
  arrayDoor.push('adventurer\'s road');
  arrayDoor.push('adventurer\'s waterfall');
  AllRoomLoaded.createNewRoomDev(0,4,1,1,1,1,3,'adventurer\'s mountain',arrayDoor);
}); 

//setTimeout(() => {
//}, 1000);
//var prettyJs = nb.beautifyJs(AllRoomLoaded);
//student = JSON.stringify(AllRoom) 


//SAVE only when quit server
/*
AllRoomLoaded.prepareToStringify();
  var data = JSON.stringify(AllRoomLoaded, null, 2);
  fs.writeFile('student.json', JSON.minify(data), (err) => {
    if (err) throw err;
  });
  */
  /*
setInterval(() => {
  AllRoomLoaded.prepareToStringify();
  var data = JSON.stringify(AllRoomLoaded, null, 2);
  fs.writeFile('student.json', JSON.minify(data), (err) => {
    if (err) throw err;
  });
}, 2000);*/



io.on('connection', (socket) => {console.log('client');
    //première création de l'user
    //var playerId = Date.now().toString();
    //var elementPrepared = new Obj(1,10,10,1,1,1,1,1,1,1,1,1,1);
    //elementPrepared.idcrea = playerId;
    //première création de l'user
  
    //elementPrepared.socket = socket;
  socket.on('action', (msg) => {//console.log(msg);
    AllRoomLoaded.action(JSON.parse(msg),socket.user);
      //socket.emit('message-from-server-to-client', msg);
  });
  socket.on('message', (msg) => {
    if (socket.user)
      AllRoomLoaded.sendAllClientInfoRoom(socket.user.room,socket.user.name+' say '+msg);
      
      //socket.emit('message-from-server-to-client', msg);
  });
  socket.on('connection', (msg) => {//console.log(AllRoomLoaded)
    var user = AllRoomLoaded.connectUser(JSON.parse(msg),socket);
    socket.user = user;
      //socket.emit('message', 'message');
      //socket.emit('message-from-server-to-client', msg);
    AllRoomLoaded.sendAllClientInfoRoom(socket.user.room,socket.user.name+' is connected');
    AllRoomLoaded.sendAllClientRoom(socket.user.room);
  });
    
      
      
});