/**
 * Created by rlaca on 03/07/2017.
 */
const util = require('util');

var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');


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


app.get('/index.html', function (req, res) {
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

            // make the client-side script manipulate the circle at client side)
            /*var clientScript = "d3.select('#" + circleId + "').transition().delay(1000).attr('fill', '#f9af26')"

            d3.select(body)
                .append('script')
                .html(clientScript)*/

            // save result in an html file, we could also keep it in memory, or export the interesting fragment into a database for later use
            /*var svgsrc = window.document.documentElement.innerHTML
            fs.writeFile('index.html', svgsrc, function(err) {
                if(err) {
                    console.log('error saving document', err)
                } else {
                    console.log('The file was saved!')
                }
            })*/
            res.render('graph', { content: el.innerHTML });
        } // end jsDom done callback
    })

    //res.sendFile( __dirname + "/" + "index.html" );
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
/*
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

console.log('Server listening on ' + HOST +':'+ PORT);*/


