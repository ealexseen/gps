var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var privateKey  = fs.readFileSync(path.resolve(__dirname, 'sslcert/server.key'), 'utf8');
var certificate = fs.readFileSync(path.resolve(__dirname, 'sslcert/server.crt'), 'utf8');
var credentials = {key: privateKey, cert: certificate};
var https = require('https').createServer(credentials, app);
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var sio = require('socket.io')(https);

app.use(express.static(path.resolve(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(
    path.resolve(__dirname, '../frontend/index.html')
  );
});

class Users {
  constructor() {
    this.map = new Map();
  }

  create(id, data) {
    return this.map.set(id, data);
  }

  get(id) {
    return this.map.get(id);
  }

  update(id, data) {
    this.map.set(id, data);
  }

  remove(id) {
    this.map.delete(id);
  }

  allData() {
    var arr = [];

    this.map.forEach((item) => {
      arr.push(item);
    });

    return arr;
  }
}

const users = new Users();

sio.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', (data) => {
    // console.log(data, socket.id);
    // console.log(users.map.size);
    console.log(users.allData());

    users.update(socket.id, data);

    socket.emit('message', users.allData());
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    users.remove(socket.id);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

https.listen(3001, () => {
  console.log('listening on *:3001');
});