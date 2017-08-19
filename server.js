var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server running...');

app.use(express.static(__dirname));

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

io.sockets.on('connection', function(socket) {
	connections.push(socket);
	console.log("Connected: %s sockets connected", connections.length);

	// disconnect
	socket.on('disconnect', function(data) {
		logoff(socket);
	});

	// logoff
	socket.on('logoff', function(data) {
		if(data) {
			logoff(socket);
		}
	});

	// send message
	socket.on('send message', function(data) {
		if(data) {
			console.log(data);
			io.sockets.emit('new message', {msg:data, user: socket.username});
		}
	});

	// update username
	socket.on('set username', function(data) {
		var oldu = socket.username;
		socket.username = data;
		if(users[users.indexOf(oldu)]) {
			users[users.indexOf(oldu)] = socket.username;
		} else {
			users.push(socket.username);
		}
		
		updateUsernames();
	});

	// new user
	socket.on('new user', function(data, callback) {
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	function updateUsernames() {
		io.sockets.emit('get users', users);
	}

	function logoff(socket) {
		if(socket.username) {
			users.splice(users.indexOf(socket.username), 1);
			updateUsernames();
		}
		connections.splice(connections.indexOf(socket), 1);
		console.log('user logged off');
	}
});

