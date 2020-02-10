
'use strict';

const Obj = require('./obj.js');
const Items = require('./items.js');
const Action = require('./action.js');
const OneRoom = require('./oneRoom.js');



function entierAleatoire(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class AllRoom{
  constructor() {
    this.roomArray = [];
    this.allRoom = [];
    this.savedItems = [];
    this.savedNameItems = [];
    this.savedNameMonsters = [];
    this.savedNamePnjs = [];
    
    this.users = [];
    this.lastName;
    this.force;
    this.dext;
    this.chance;
    this.charme;
    this.reputation;
    this.level;
    //this.name;
  }
  /** load data of server by file json */
  loadRoomByFile(file){
    file.forEach(user => {
      var varobj = Object.assign(new Obj(this),user);
      var varItems = [];
      user.items.forEach(item => {
        var varitem = Object.assign(new Items(this),item);
        varItems.push(varitem);
      });
      varobj.items = varItems;
      this.roomArray.forEach(room => {
        if(room.name == varobj.room)
        room.object.push(varobj);
      });
      this.users.push(varobj);
    })

    /*this.users = file.users;
    this.roomArray.forEach(room => {
      file.users.forEach(user => {
        if (user.room == room.name){
          obj = Object.assign(new Obj(this),obj);
          room.object.push(obj);
        }
      })
    })*/

    /*this.roomArray = file.roomArray;
    //this.allRoom = file.allRoom;
    this.savedItems = file.savedItems;
    this.savedNameItems = file.savedNameItems;
    this.savedNameMonsters = file.savedNameMonsters;
    this.roomArray.forEach(room => { //charger le owner dans les items ,supprimé en amont pour evité circular object pendant l'enregistrement
      room.object.forEach(obj => {
        obj = Object.assign(new Obj(this),obj);
        //obj.monsterAttack();//maybe to delete because launch up in new Obj
        obj.items.forEach(item => {
          item = Object.assign(new Items(this),item);
          item.owner = obj;
          //obj.nbrItems += 1;
        });
      });
    });*/
  }
  addNammeAtLoad(name){
    this.savedNamePnjs.push(name);
  }
  getNammeAtLoad(){//console.log(this.savedNamePnjs[entierAleatoire(0,this.savedNamePnjs.length)]);
    this.lastName = this.savedNamePnjs[entierAleatoire(0,this.savedNamePnjs.length)];
    return this.savedNamePnjs[entierAleatoire(0,this.savedNamePnjs.length)];
  }
  /** prepare for save all server in json in file */
  prepareToStringify(){
    this.users.forEach(user => { 
      user.AllRooms = [];//supression des obj pour le send
      user.socket = [];//supression des socket
      user.itemEquip1 = {};//supression des socket
      user.itemEquip2 = {};//supression des socket
      user.itemEquip3 = {};//supression des socket
      user.items.forEach(item => {
        item.AllRooms = [];
      });
    })
    /*this.savedItems.forEach(item => { 
      item.AllRooms = [];
    });
    this.roomArray.forEach(element => { 
      element.object.forEach(obj => {//mise en cache des obj de la room
        obj.AllRooms = [];//supression des obj pour le send
        obj.socket = [];//supression des socket
        obj.itemEquip1 = {};//supression des socket
        obj.itemEquip2 = {};//supression des socket
        obj.itemEquip3 = {};//supression des socket
        obj.items.forEach(item => {
          item.AllRooms = [];
        });
      });
    });*/
  }
  /** connection user */
  connectUser(msg,socket){
    var exist;
    exist = 0;
    this.users.forEach(user => {
      if (user.name == msg.name && user.socket.connected != true){
        if (user.password == msg.password){
          exist = 1;
          var varObj = Object.assign(new Obj(this),user);
          delete varObj.socket;
          varObj.socket = socket;
          varObj.AllRooms = this;
          socket.user = varObj;
          this.roomArray.forEach(room => {
            if(room.name == varObj.room){
              room.object.push(varObj);
            }
          })
          this.sendAllClientRoom(varObj.room);
          this.sendAllClientInfoRoom(varObj.room,varObj.name+' is connected');
          return 1;
        }
      }
    })
    if(exist == 0 )
      this.creationAccount(msg,socket)
    /*for (var i = 0, len = this.users; i < len; i++) {
    //this.users.forEach(user => {
      if (this.users[i].name == msg.name && this.users[i].socket.connected != true){
        if (this.users[i].password == msg.password){
          exist = true;
          var varObj = Object.assign(new Obj(this),this.users[i]);
          delete this.users[i];
          varObj.socket = socket;
          console.log(varObj.room);
          //socket.user = user;
          this.sendAllClientRoom(varObj.room);
          this.sendAllClientInfoRoom(varObj.room,varObj.name+' is connected');
          this.users.push(varObj);
          return varObj;
        }else{
          //return 'password is wrong';
        }
      }
    };*/
    /** register */
  }

  creationAccount(msg,socket){
      console.log('create user')
      var tempUser = new Obj(this,1,10,10,3,3,3,3,3,3,3,3,0,1,msg.name,Date.now(),'port',msg.password,0);
      tempUser.addItems(new Items(this,this.getNammeAtLoad(),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(1000,5000),1,tempUser.id));
      tempUser.addItems(new Items(this,'consomable',entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(1000,5000),1,tempUser.id));
      tempUser.addItems(new Items(this,'persistant',entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(1000,5000),2,tempUser.id));
      tempUser.socket = socket;
      tempUser.ressource = 100;
      this.users.push(tempUser);
      this.roomArray[0].object.push(tempUser);
      socket.user = tempUser
      this.sendAllClientInfoRoom(socket.user.room,socket.user.name+' is connected');
      this.sendAllClientRoom(socket.user.room);
      return tempUser;
    
  }
  createMonsterOrPnj(room){
    this.roomArray.forEach(element => {
      if(element.name == room && entierAleatoire(1,25) == 5){
        if(element.danger > 0){
          var tempObj = new Obj(this,3,entierAleatoire(10,10*element.danger),entierAleatoire(10,10*element.danger),entierAleatoire(1,1*element.danger),entierAleatoire(1,1*element.danger),entierAleatoire(1,1*element.danger),entierAleatoire(1,1*element.danger),entierAleatoire(1,1*element.danger),entierAleatoire(1,1*element.danger),entierAleatoire(1,1*element.danger),entierAleatoire(1,1*element.danger),0,entierAleatoire(1,1*element.danger),this.getNammeAtLoad(),Date.now(),room,element.name,entierAleatoire(1,20),entierAleatoire(1,11));
          element.object.push(tempObj);
        }else{
          this.generateStats();
          var tempObj = new Obj(this,2,10,10,this.force,this.force,this.dext,this.dext,this.chance,this.chance,this.charme,this.charme,this.reputation,this.level,this.getNammeAtLoad(),Date.now(),room,'',0,entierAleatoire(1,37));
          element.object.push(tempObj);
        }
      }
    });
  }
  /** reception message of user and launch action*/
  action(msg,user){
    this.createMonsterOrPnj(msg.room);
    var action = new Action(this,msg,user);
    action.AllRooms = this;
  }
  /** check if name doesn't exist and add in array's name */
  addNameItems(name){
    if (!this.savedNameItems.includes(name))
      this.savedNameItems.push(name);
  }
  /** check if name doesn't exist and add in array's name */
  addNameMonster(name){
    if (!this.savedNameMonsters.includes(name))
      this.savedNameMonsters.push(name);
  }
  /** check if name doesn't exist and add in array's name */
  addNamePnj(name){
    if (!this.savedNamePnjs.includes(name))
      this.savedNamePnjs.push(name);
  }
  /*generateNamePnj(name){
    if (!this.savedNamePnjs.includes(name))
      this.savedNamePnjs.push(name);
  }*/
  /** create a new room for development */
  createNewRoomDev(nbrItems,type2,type3,type4,type5,type6,danger,name,arrayDoor){
    var varRoom = new OneRoom(danger,name);
    var type = 0;
    for (let i = 1; i <= 6; i++) {//if(name == 'port'){console.log(name);}
      if (i == 1){type = type2;}else if (i == 2){type = type3;}else if (i == 3){type = type4;}else if (i == 4){type = type5;}else if (i == 6){type = type6;}
      for (let i2 = 0; i2 < type; i2++) {//if(name == 'port'){console.log(i,type,i2);}
        this.generateStats(i);
        if(i == 2){
          var image = entierAleatoire(1,37);
        }else if(i == 3){
          var image = entierAleatoire(1,11);
        }
        var varName;
        if(i == 4){varName = 'build'}else if(i == 5){varName = 'forge'}else if(i == 6){varName = 'alchemy'}else{varName = this.getNammeAtLoad()}
        var obj = new Obj(this,i,10,10,this.force,this.force,this.dext,this.dext,this.chance,this.chance,this.charme,this.charme,this.reputation,this.level,varName,Date.now(),name,'',entierAleatoire(1,20),image);
        for (let i = 0; i < nbrItems; i++) 
          obj.addItems(new Items(this,this.getNammeAtLoad(),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(-3,5),entierAleatoire(1000,5000),entierAleatoire(1,2),obj.id));
        varRoom.object.push(obj);
      }
    }
    for (let i3 = 0; i3 < arrayDoor.length; i3++) {//console.log(arrayDoor[i3]);
      var obj = new Obj(this,7,10,10,this.force,this.force,this.dext,this.dext,this.chance,this.chance,this.charme,this.charme,this.reputation,this.level,arrayDoor[i3],Date.now(),name,'',0,arrayDoor[i3]);//DOOR
      varRoom.object.push(obj);
    }
    this.roomArray.push(varRoom);
  }
  /** generate stats for create obj */
  generateStats(type){
    this.force = entierAleatoire(1,5);
    this.dext = entierAleatoire(1,5);
    this.chance = entierAleatoire(1,5);
    this.charme = entierAleatoire(1,5);
    this.reputation = entierAleatoire(1,5);
    this.level = entierAleatoire(1,5);
  }

  actualizeObj(obj){
    if(obj.dateLastConso != 0){
      if(Date.now()-obj.dateLastConso > obj.timeConso){
        obj.force = obj.forcemax;
        obj.dext = obj.dext;
        obj.chance = obj.chance;
        obj.charme = obj.charme;
        obj.timeConso = 0;
        obj.dateLastConso = 0;
      }
    }
    obj.monsterAttack();
  }

  deleteStatsUselessForSend(varObj){
    delete varObj.id;
    delete varObj.password;
    delete varObj.agressivity;

    delete varObj.hp;
    delete varObj.hpmax;
    delete varObj.force;
    delete varObj.forcemax;
    delete varObj.dext;
    delete varObj.dextmax;
    delete varObj.chance;
    delete varObj.chancemax;
    delete varObj.charme;
    delete varObj.charmemax;
    delete varObj.reputation;
            
    delete varObj.level;
            
    delete varObj.timeaction;

    delete varObj.action ;
    delete varObj.nbrItems ;//persistant
    delete varObj.idcrea;
    delete varObj.description;
    delete varObj.cible;
    

    delete varObj.AllRooms;
    delete varObj.socket;
    return varObj;
  }
  /** send all client at all client of room where is client's action launch */
  sendAllClientRoom(roomName){// envoyer les info d'une room a tout les clients de cet room
    this.roomArray.forEach(element => {
      if (element.name == roomName){
        var objToSend = [];
        element.object.forEach(obj => {
          this.actualizeObj(obj);
          if (obj.type == 1 && obj.socket.connected == false){}else{
            var varObj = Object.assign(new Obj(this),obj);
            if (obj.type == 1 || obj.type == 0){
              var varItems = [];
              varObj.items.forEach(item => {
                if(!Array.isArray(item)){
                  item.AllRooms = [];
                  item.owner = [];
                  varItems.push(item);
                }
              });
              varObj.items = varItems;
              if(varObj.itemEquip1){
                varObj.itemEquip1.AllRooms = [];
                varObj.itemEquip1.owner = [];
                varObj.itemEquip1.level = [];
                varObj.itemEquip1.time = [];
              }
              if(varObj.itemEquip1){
                varObj.itemEquip2.AllRooms = [];
                varObj.itemEquip2.owner = [];
                varObj.itemEquip2.level = [];
                varObj.itemEquip2.time = [];
              }
              if(varObj.itemEquip1){
                varObj.itemEquip3.AllRooms = [];
                varObj.itemEquip3.owner = [];
                varObj.itemEquip3.level = [];
                varObj.itemEquip3.time = [];
              }
            }else{
              varObj.itemEquip1 = [];
              varObj.itemEquip2 = [];
              varObj.itemEquip3 = [];
              varObj.items = [];
              delete varObj.ressource;
            }
            varObj = this.deleteStatsUselessForSend(varObj);
            objToSend.push(varObj);
          }
        });
        element.object.forEach(client => {
          if(client.type == 1 && client.socket.connected == true){
            client.socket.emit('allObj', objToSend);//console.log(client.name);
          }
        });
      }
    });
  }
  /** send message at all client in the room of client's action launch */
  sendAllClientInfoRoom(roomName,message){//envoi juste une nouvelle info dans le chat, pour éviter la perte de perf a devoir tout envoyé a chaque fois, rajouter un petit timeout dessus
    this.roomArray.forEach(element => {
      if (element.name == roomName){//check room 
        
        element.object.forEach(obj =>  {
          if (obj.type == 1){
            if (obj.socket.connected == true)
              obj.socket.emit('message', message);
          }
        });
        return;
      }
    });
  }
  /** send all client of room to one client where is client's action launch */
  sendOneClientRoom(roomName,client){
    var objToSend = [];
    this.roomArray.forEach(element => {
      if (element.name == roomName){//check room 
        element.object.forEach(obj => {
          this.actualizeObj(obj);
          if (obj.type == 1 && obj.socket.connected == false){}else{
            var varObj = Object.assign(new Obj(this),obj);
            varObj.AllRooms = [];//supression des obj pour le send
            varObj.socket = [];//supression des socket
            varObj = this.deleteStatsUselessForSend(varObj);
            if (obj.type == 1 || obj.type == 0){
              varObj.items.forEach(item => {
                item.AllRooms = [];
                item.owner = [];
              });
            }else{
              varObj.itemEquip1 = [];
              varObj.itemEquip2 = [];
              varObj.itemEquip3 = [];
              varObj.items = [];
            }
            objToSend.push(varObj);
          }
        });
        element.object.forEach(obj =>  {
          if (obj == client){
            if (obj.socket.connected == true)
              obj.socket.emit('oneObj', objToSend);
          }
        });
        return;
      }
    });
  }
  /** send message at one client in the room of client's action launch */
  sendOneClientInfoRoom(roomName,message,client){//envoi juste une nouvelle info dans le chat, pour éviter la perte de perf a devoir tout envoyé a chaque fois, rajouter un petit timeout dessus
    
    this.roomArray.forEach(element => {
      if (element.name == roomName){//check room 
        element.object.forEach(obj =>  {
          if (obj.type == 1 && obj == client){
            if (obj.socket.connected == true)
              obj.socket.emit('message', message);
          }
        });
        return;
      }
    });
  }

  /** return an aleatory items equivalent at level of items or monster killed */
  getItemsAleatoire(level,to){
    var tmpItems = [];
    this.savedItems.forEach(element => {
      if (element.level > level-2 && element.level < level+2 ){
        tmpItems.push(Object.assign(new Items(this),element));
      }
    });
    if(!tmpItems[0]){
      this.savedItems.forEach(element => {
        tmpItems.push(Object.assign(new Items(this),element));
      });
    }
    var tmpNbrItems = entierAleatoire(0,tmpItems.length);
    var item = tmpItems[tmpNbrItems];
    item.AllRooms = this;
    return item;
  }

  /** send my client to me */
  sendMeObj(roomName,client){
    this.roomArray.forEach(element => {
      if (element.name == roomName){//check room 
        element.object.forEach(obj => {
          this.actualizeObj(obj);
          if (obj == client){
            var varObj = Object.assign(new Obj(this),obj);
            varObj.AllRooms = [];//supression des obj pour le send
            varObj.socket = [];//supression des socket
            varObj = this.deleteStatsUselessForSend(varObj);
            varObj.items.forEach(item => {
              item.AllRooms = [];
              item.owner = [];
            });
            obj.socket.emit('meObj', varObj);
            return;
          }
        });
      }
    });
  }

  
}

module.exports = AllRoom;