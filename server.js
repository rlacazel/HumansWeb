/**
 * Created by rlaca on 03/07/2017.
 */
//==============================
//======== CONFIG ==============
//==============================
const util = require('util');
var path = require('path');
var converter = require('./converter');

// Express
var express = require('express');
var app = express();
app.use(express.static('public'));

var storyline = [];
var java_client;

// IO
var io = require('socket.io').listen(app.listen(3700));

// Bodyparser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // this is used for parsing the JSON object from POST

// set up handlebars view engine
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

io.sockets.on('connection', function (socket)
{
    console.log('Connection from web page');
    if (java_client == null) {
        io.sockets.emit('js_client', {data: 'error:Virtual Environement not running !'});
    }
    else {
        send_message_to_humans('askuritype');
    }
    for(i = 0; i < storyline.length; i++)
    {
        socket.emit('js_client', {data: storyline[i]});
    }
});


//==============================
//======== ROUTING SERVER ======
//==============================

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
    res.render('graph', { content: '' });
})

// This responds a POST request for the homepage
app.post('/', function (req, res) {
    console.log("Got a POST request for the homepage");
    res.send('Hello POST');
})

app.get('/index.html', function (req, res)
{
    res.render('graph', { content: '' });
})

// Receive command to execute in VE
app.post('/action', function (req, res) {
    var id = req.body.id;
    /*if(id == 'trigger') {
        console.log('action:triggered:PutBandageHemostaticOnP1');
        io.sockets.emit('js_client', {data: 'action:triggered:PutBandageHemostaticOnP1'});
    }
    else if(id == 'ack') {
        console.log('action:ack_success:PutBandageHemostaticOnP1');
        io.sockets.emit('js_client', {data: 'action:ack_success:PutBandageHemostaticOnP1'});
    }
    else */
    if (id == 'gotoandanimate') {
        var nurse = req.body.nurse;
        var action = req.body.action;
        var part= req.body.part;
        var victim = req.body.victim;
        console.log('send: gotoandanimate:'+nurse+':'+action+':'+part+':'+victim);
        var txt = 'action:GotoAndAnimate('+nurse+', '+action+', '+part+', '+victim+')';
        storyline.push(txt)
        io.sockets.emit('js_client', {data: txt});
        send_message_to_humans('gotoandanimate:'+nurse+':'+action+':'+part+':'+victim);
    }
    else if (id == 'gotoandtake') {
        var nurse = req.body.nurse_take;
        var object = req.body.object_take;
        console.log('send: gotoandtake:'+nurse+':'+object);
        var txt = 'action:GotoAndTake('+nurse+', '+object+')';
        storyline.push(txt);
        io.sockets.emit('js_client', {data: txt});
        send_message_to_humans('gotoandtake:'+nurse+':'+object);
    }
    else if (id == 'attribute') {
        var attr = req.body.attr;
        var value = req.body.attr_value;
        var object = req.body.attr_object;
        console.log('send: attribute:'+attr+':'+value+':'+object);
        var txt = 'action:Attribute('+attr+', '+value+', '+object+')';
        storyline.push(txt);
        io.sockets.emit('js_client', {data: txt});
        send_message_to_humans('attribute:'+attr+':'+value+':'+object);
    }
    else if (id == 'start') {
        io.sockets.emit('js_client', {data: 'trigger:Start'});
    }
    res.end();
})


// custom 404 page
// app.use it called when nothing before matches the uri
app.use(function(req, res, next) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})

// -------------------------
// Communication with Humans
// -------------------------
var net = require('net');

var HOST = '127.0.0.1'; // parameterize the IP of the Listen
var PORT = 6969; // TCP LISTEN port

// Create an instance of the Server and waits for a conexão
net.createServer(function(sock) {

    // Receives a connection - a socket object is associated to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    // Link client
    java_client = net.connect({port: 1234}, function() {
        console.log('connected to server!');
    });

    java_client.on('data', function(data) {
        console.log('Received: ' + data);
        // client.destroy(); // kill client after server's response
    });

    java_client.on('close', function() {
        console.log('Connection closed');
        io.sockets.emit('js_client', {data: 'error:Virtual Environement not running !'});
        java_client = null;
    });

    java_client.on("error", function(exception) {
        console.log("Client closed");
        console.log(exception.stack);
        io.sockets.emit('js_client', {data: 'error:Virtual Environement not running !'});
        java_client = null;
    });

    sock.on("error", function(exception) {
        console.log("Client closed");
        console.log(exception.stack);
    });

    // Receive message from Humans
    sock.on('data', function(data) {
        console.log('| Receive from Humans: ' + data);
        var string = String.fromCharCode.apply(null, data);
        if(string.startsWith("Connecte"))
        {
            io.sockets.emit('js_client', {data: 'error:'});
        }
        else {
            if (string.startsWith("action:") || string.startsWith("uritype:")) {
                io.sockets.emit('js_client', {data: string});
            }
        }
    });

    // Add a 'close' - "event handler" in this socket instance
    sock.on('close', function(data) {
        // closed connection
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
        storyline = [];
    });


}).listen(PORT, HOST);

function send_message_to_humans(msg)
{
    if (java_client != null)
    {
        java_client.write(msg+ '\n');
    }
}

console.log('Server listening on ' + HOST +':'+ PORT);