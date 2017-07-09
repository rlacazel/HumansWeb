/**
 * Created by rlaca on 03/07/2017.
 */
const util = require('util');

var express = require('express');
var path = require('path');

var app = express();
var fortune = require('./lib/fortune.js');
var listeners = [];
var java_client;

var io = require('socket.io').listen(app.listen(3700));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // this is used for parsing the JSON object from POST

app.use(express.static('public'));

// set up handlebars view engine
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

io.sockets.on('connection', function (socket) {
    // socket.emit('refresh_client', { message: 'welcome to the chat' });
    /*socket.on('send', function (data) {
        io.sockets.emit('refresh_client', data);
    });*/
});

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
    console.log("Got a GET request for the homepage");
    //res.send('Hello GET');
    res.sendFile('index.html', { root: __dirname });
})

// This responds a POST request for the homepage
app.post('/', function (req, res) {
    console.log("Got a POST request for the homepage");
    //res.send('Hello POST');
})

app.get('/about', function(req, res){
    res.render('about', { fortune: fortune.getFortune() });
});


// This responds a DELETE request for the /del_user page.
app.delete('/del_user', function (req, res) {
    console.log("Got a DELETE request for /del_user");
    res.send('Hello DELETE');
})

// This responds a GET request for the /list_user page.
app.get('/list_user', function (req, res) {
    console.log("Got a GET request for /list_user");
    res.send('Page Listing');
})

// This responds a GET request for abcd, abxcd, ab123cd, and so on
app.get('/ab*cd', function(req, res) {
    console.log("Got a GET request for /ab*cd");
    res.send('Page Pattern Match');
})

/*function update_graph(callback)
{
    var res;
    var d3 = require('d3')
        , jsdom = require('jsdom')
        , fs = require('fs')
        , htmlStub = '<div id="dataviz-container"></div>'

    jsdom.env({
        features : { QuerySelector : true }
        , html : htmlStub
        , done : function(errors, window) {
            // this callback function pre-renders the dataviz inside the html document, then export result into a static file

                var el = window.document.querySelector('#dataviz-container')
                    //, body = window.document.querySelector('body')
                    , circleId = 'a2324'  // say, this value was dynamically retrieved from some database

                // generate the dataviz
                d3.select(el)
                    .append('svg:svg')
                    .attr('width', 600)
                    .attr('height', 300)
                    .append('circle')
                    .attr('cx', 300)
                    .attr('cy', 150)
                    .attr('r', 30)
                    .attr('fill', '#26963c')
                    .attr('id', circleId) // say, this value was dynamically retrieved from some database

            callback(el.innerHTML);
        }
    })
    //return res;
}*/

// Ref: https://mango-is.com/blog/engineering/pre-render-d3-js-charts-at-server-side/
app.get('/index.html', function (req, res) {
    //update_graph(function(html_graph) {res.render('graph', { content: html_graph })});
    res.render('graph', { content: '' });

})

// This responds a POST request for the homepage
app.post('/action', function (req, res) {
    console.log('body: ' + util.inspect(req.body.id, false, null));
    io.sockets.emit('refresh_client', { data: 'this is the data'});
    /*
    var id = req.body.id.toString();
    if (java_client != null) {
        java_client.write('action:' + id + '\n');
    }*/
    res.end();
})

app.get('/process_get', function (req, res) {
    // Prepare output in JSON format
    response = {
        first_name:req.query.first_name,
        last_name:req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
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


app.post('/start', function (req, res)
{
    res.body = req.body + "modified";
    res.send(res.body);
})

// --------------
// Server of Java JADE
// ------------
var net = require('net');

var HOST = '127.0.0.1'; // parameterize the IP of the Listen
var PORT = 6969; // TCP LISTEN port

// Create an instance of the Server and waits for a conexão
net.createServer(function(sock) {

    // Receives a connection - a socket object is associated to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    listeners.push(sock);

    // Link client
    //java_client = net.connect(1234, 'localhost');
    java_client = net.connect({port: 1234}, function() {
        console.log('connected to server!');
    });

    java_client.on('data', function(data) {
        console.log('Received: ' + data);
        // client.destroy(); // kill client after server's response
    });

    java_client.on('close', function() {
        console.log('Connection closed');
    });

    java_client.on("error", function(exception) {
        console.log("Client closed");
        console.log(exception.stack);
    });

    //just added
    sock.on("error", function(exception) {
        console.log("Client closed");
        console.log(exception.stack);
    });

    // Add a 'data' - "event handler" in this socket instance
    sock.on('data', function(data) {
        console.log('DATA RECEIVE: ' + data);

        // sock.write(data);
    });


    // Add a 'close' - "event handler" in this socket instance
    sock.on('close', function(data) {
        // closed connection
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });


}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);