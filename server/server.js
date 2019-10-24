require('console-stamp')(console, '[HH:MM:ss.l]');

var path = require("path");
const root_dir = path.resolve(path.join(__dirname, "../"));

var express = require('express');
var app = express();
var admin_app = express();

var http = require('http');
var server = http.createServer(app);
var admin_server = http.createServer(admin_app);

var io = require('socket.io')(server);
var admin_io = require('socket.io')(admin_server);
const shortid = require('shortid');

var adjectives = require('./adjectives.json')["adjectives"];
var animals = require('./animals.json')["animals"];

// Load static files
app.use(express.static(path.join(root_dir, 'build')));

var clients = {};
var client_sockets = {};
var chat_msgs = [];

function generate_name() {
    var rand_adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    var rand_animal = animals[Math.floor(Math.random() * animals.length)];
    return rand_adjective + " " + rand_animal;    
}

function client_exists(uuid) {
    for (var addr in clients) {
        if (clients[addr].uuid === uuid) {
            return true;
        }
    }
    return false;
}

function generate_uuid() {
    var uuid = "";
    do {
        uuid = generate_name();
    } while (client_exists(uuid));
    return uuid;
}

// Routes
app.get('/', function(req, res){
    res.sendFile(path.join(root_dir, 'build/index.html'));
});

app.get('/monitor', function(req, res){
    res.sendFile(path.join(root_dir, 'build/index.html'));
});

// Socket events
const req_ns = io.of('/requests');

function publish_active_requests() {
    // Get all active requests from clients
    active_requests = []

    for (var addr in clients) {
        if (clients[addr].active_request !== null) {
            active_requests.push(clients[addr].active_request);
        }
    }

    req_ns.emit('active_requests', active_requests);
}


req_ns.on('connection', function(socket){
    console.log('New connection to requests channel');
    publish_active_requests();
});


io.on('connection', function(socket) {
    console.log('New connection from ' + socket.handshake.address);
    // Add the new client to the list
    if (!(socket.handshake.address in clients)) {
        client_sockets[socket.handshake.address] = socket;
        clients[socket.handshake.address] = {}
        clients[socket.handshake.address].active_request = null;
        clients[socket.handshake.address].address = socket.handshake.address;
        clients[socket.handshake.address].num_requests = 0;
        clients[socket.handshake.address].uuid = "";
        clients[socket.handshake.address].name = "";

        socket.on('new_request', function(msg, callback) {
            var client = clients[socket.handshake.address];
            console.log('New request from ' + socket.handshake.address);
            if (client.uuid === "") {
                console.error('Client ' + socket.handshake.address + ' has no UUID yet ');
                callback('no_id');
                return;
            }
            if (client.active_request !== null) {
                console.log(client.name + ' already has an active request');
                callback('active_request');
                return;
            }
            if (client.num_requests >= 5) {
                console.log('Request limit reached for ' + client.name);
                callback('request_limit');
                return;
            }

            console.log('New request from ' + client.name);
            console.log(msg);
            var id = shortid.generate();
            var req = {data: msg};
            req.time = new Date();
            req.id = id;
            req.uuid = client.uuid;
            req.status = "Pending";
            callback(req);
            client.active_request = req;
            client.num_requests++;

            publish_active_requests();
            admin_io.emit('update_client', client);
        });

        socket.on('cancel_request', function(callback) {
            var client = clients[socket.handshake.address];
            console.log('New cancel from ' + socket.handshake.address);
            if (client.uuid === "") {
                console.error('Client ' + socket.handshake.address + ' has no UUID yet ');
                callback('no_id');
                return;
            }
            if (client.active_request === null) {
                console.log(client.name + ' has no active request');
                callback('no_request');
                return;
            }

            console.log(client.name + " canceled the request");

            client.active_request = null;
            publish_active_requests();
            admin_io.emit('update_client', client);
        });

        socket.on('disconnect', function() {
            console.log("User " + socket.handshake.address + " disconnected");
            delete clients[socket.handshake.address];
            publish_active_requests();
            admin_io.emit('clients', clients);
        });

        socket.on('chat_msg', function(msg) {
            var client = clients[socket.handshake.address];
            console.log(client.name + " sent a chat msg:\n" + msg);
            if (client.uuid === "") {
                console.error('Client ' + socket.handshake.address + ' has no UUID yet ');
                return;
            }

            var broadcast_msg = {
                id: client.uuid,
                time: new Date(),
                data: msg
            }
            io.emit('chat_msg', broadcast_msg);
        });
    }

    socket.on('get_uuid', function(name, callback) {
        console.log("Creating UUID for " + name);
        var client = clients[socket.handshake.address];
        if (client.uuid !== "") {
            console.error('Client ' + socket.handshake.address + ' already has UUID');
            callback(-1);
            return;
        }
        console.log('Client ' + socket.handshake.address + ' name: ' + name);
        // var id = shortid.generate();
        var id = generate_uuid();
        console.log("UUID: " + id);
        client.uuid = id;
        client.name = name;
        callback(id);
        admin_io.emit('update_client', client);
    });

});

admin_io.on('connection', function(socket) {
    console.log('New admin connection');
    console.log(socket.handshake.address);
    admin_io.emit('clients', clients);

    socket.on('request_cmd', function(cmd) {
        console.log("New cmd:");
        console.log(cmd);
        if (!(cmd.client_addr in clients)) {
            console.log("Client " + cmd.client_addr + " not found");
            return;
        }
        if (cmd.action === "kick") {
            client_sockets[cmd.client_addr].emit("kick", cmd.msg);
            client_sockets[cmd.client_addr].disconnect(0);
            delete client_sockets[cmd.client_addr];
            delete clients[cmd.client_addr];
            publish_active_requests();
            return;
        }

        var client = clients[cmd.client_addr];
        switch (cmd.action) {
            case "accept":
                client_sockets[cmd.client_addr].emit("request_accepted", cmd.msg);
                client.active_request.status = "Processing";
                break;
            case "delay":
                client_sockets[cmd.client_addr].emit("request_delayed", cmd.msg);
                client.active_request.status = "Delayed";
                break;
            case "reject":
                client_sockets[cmd.client_addr].emit("request_rejected", cmd.msg);
                client.active_request.status = "Rejected";
                break;
            case "finish":
                client_sockets[cmd.client_addr].emit("request_finished", cmd.msg);
                client.active_request = null;
                break;
            default:
                break;
        }
        publish_active_requests();
        admin_io.emit('update_client', client);
    });
});


server.listen(80, function(){
    console.log('Server listening on *:80');
});

admin_server.listen(5555, '0.0.0.0', function(){
    console.log('Admin listening on localhost:5555');
});
