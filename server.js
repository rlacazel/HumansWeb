/**
 * Created by rlaca on 03/07/2017.
 */
const util = require('util');

var express = require('express');
var app = express();
app.use(express.static('public'));

// set up handlebars view engine
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
})

// This responds a POST request for the homepage
app.post('/', function (req, res) {
    console.log("Got a POST request for the homepage");
    res.send('Hello POST');
})

var fortunes = ["Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple.", ];

app.get('/about', function(req, res){
    var randomFortune =  fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', { fortune: randomFortune });
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

app.get('/index.html', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
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
// Communication with Java JADE
// ------------
var net = require('net');
var HOST = '127.0.0.1'; // parameterize the IP of the Listen
var PORT = 6969; // TCP LISTEN port

// Create an instance of the Server and waits for a conexão
net.createServer(function(sock) {

    // Receives a connection - a socket object is associated to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    //just added
    sock.on("error", function(exception) {
        console.log("Client closed");
        //console.log(exception.stack);
    });

    // Add a 'data' - "event handler" in this socket instance
    sock.on('data', function(data) {
        console.log('DATA RECEIVE: ' + data);
        // data was received in the socket
        // Writes the received message back to the socket (echo)
        sock.write(data);
    });


    // Add a 'close' - "event handler" in this socket instance
    sock.on('close', function(data) {
        // closed connection
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });


}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);


