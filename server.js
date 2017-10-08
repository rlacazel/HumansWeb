/**
 * Created by rlaca on 03/07/2017.
 */
//==============================
//======== CONFIG ==============
//==============================
const util = require('util');
var path = require('path');
var converter = require('./converter');
var planner = require('./plan');

// Express
var express = require('express');
var app = express();
app.use(express.static('public'));

// globale variables
var storyline = [];
var timeouts_handler = [];
var java_client;
var uritype;
var plan_graph;
var scenario_ongoing = false;

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
    if (java_client == null)
    {
        io.sockets.emit('js_client', {data: 'error:The virtual environment is offline !'});
    }
    else if (uritype == null || uritype.length < 100)
    {
        send_message_to_humans('askuritype');
    }
    else // init page with type
    {
        socket.emit('js_client', {data: uritype});
    }
    for(i = 0; i < storyline.length; i++)
    {
        socket.emit('js_client', {data: storyline[i]});
    }

    plan_graph = planner.build_graph();
    socket.emit('js_client', {data: 'graph:' + JSON.stringify(planner.get_stringified_graph(plan_graph))});
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

app.post('/simulate_action', function (req, res) {
    var id = req.body.id;
    plan_graph.node(id).state = 'executed';
    io.sockets.emit('js_client', {data: 'ack:success:' + plan_graph.node(id).label});
    res.end();
})

// Receive command to execute in VE
app.post('/action', function (req, res) {
    var id = req.body.id;
    if (id == 'gotoandanimate') {
        var nurse = req.body.nurse;
        var action = req.body.action;
        var part= req.body.part;
        var victim = req.body.victim;
        var msg = 'gotoandanimate:'+nurse+':'+action+':'+part+':'+victim;
        console.log('send: ' + msg);
        var txt = 'action:' + converter.convert_humans_msg_to_storyline_msg(msg);
        storyline.push(txt)
        io.sockets.emit('js_client', {data: txt});
        send_message_to_humans(msg);
    }
    else if (id == 'gotoandtake') {
        var nurse = req.body.nurse_take;
        var object = req.body.object_take;
        var msg = 'gotoandtake:'+nurse+':'+object;
        console.log('send: ' + msg);
        var txt = 'action:' + converter.convert_humans_msg_to_storyline_msg(msg);
        storyline.push(txt);
        io.sockets.emit('js_client', {data: txt});
        send_message_to_humans(msg);
    }
    else if (id == 'attribute') {
        var attr = req.body.attr;
        var value = req.body.attr_value;
        var object = req.body.attr_object;
        var msg = 'attribute:'+attr+':'+value+':'+object;
        console.log('send: ' + msg);
        var txt = 'action:' + converter.convert_humans_msg_to_storyline_msg(msg);
        storyline.push(txt);
        io.sockets.emit('js_client', {data: txt});
        send_message_to_humans(msg);
    }
    else if (id == 'startscenario')
    {
        io.sockets.emit('js_client', {data: 'startscenario'});
        scenario_ongoing = true;
        loop();
    }
    else if (id == 'pausescenario')
    {
        scenario_ongoing = false;
        io.sockets.emit('js_client', {data: 'pausescenario'})
    }
    else if (id == 'stopscenario')
    {
        scenario_ongoing = false;
        for (var i = 0; i < timeouts_handler.length; i++) {
            clearTimeout(timeouts_handler[i]);
        }
        io.sockets.emit('js_client', {data: 'stopscenario'});;
        storyline = [];
        plan_graph = planner.build_graph();
        io.sockets.emit('js_client', {data: 'graph:' + JSON.stringify(planner.get_stringified_graph(plan_graph))});
    }
    res.end();
})

// Loop every second
function loop()
{
    if (scenario_ongoing)
    {
        var n = planner.get_next_nodes_to_execute(plan_graph);
        if (n != null)
        {
            var d = plan_graph.node(n).delay*1000;
            if (d > 0)
            {
                io.sockets.emit('js_client', {data: 'timer:' + n + ':' + d});
            }
            plan_graph.node(n).state = 'ongoing';
            const timeoutObj = setTimeout(function(){execute_node(n);},d);
            timeouts_handler.push(timeoutObj);

        }
        setTimeout(function () {loop();}, 1000);
    }
}

function execute_node(node_id)
{
    if (scenario_ongoing)
    {
        io.sockets.emit('js_client', {data: 'trigger:' + node_id});
        var commands = converter.convert_action_plan_to_action_executable_in_ev(plan_graph.node(node_id).label);
        if (commands.length > 0) {
            for (var i = 0; i < commands.length; i++) {
                var txt = 'action:' + converter.convert_humans_msg_to_storyline_msg(commands[i]);
                storyline.push(txt);
                io.sockets.emit('js_client', {data: txt});
                send_message_to_humans(commands[i]);
            }
        }
        plan_graph.node(node_id).state = 'executed';
    }
}

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
        storyline = [];
        java_client = null;
        uritype = null;
    });

    java_client.on("error", function(exception) {
        console.log("Client closed");
        console.log(exception.stack);
        io.sockets.emit('js_client', {data: 'error:Virtual Environement not running !'});
        storyline = [];
        java_client = null;
        uritype = null;
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
            // Receive from humans ack for trigger or success of action
            // if it is an ack success, set action in plan as executed
            if (string.startsWith("ack:"))
            {
                var splitted = string.split(':');
                if (splitted[1]=='success')
                {
                    var id = planner.get_id_from_label(plan_graph,splitted[2].trim())
                    if (id!=null) {
                        plan_graph.node(id).state = 'executed';
                    }
                }
                io.sockets.emit('js_client', {data: string});
            }
            // uritype for the mapping between types and uris
            else if (string.startsWith("uritype:"))
            {
                uritype = string;
                io.sockets.emit('js_client', {data: uritype});
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
        console.log('Send to java: ' + msg);
        java_client.write(msg+ '\n');
    }
}

console.log('Server listening on ' + HOST +':'+ PORT);

/* var java_process = require('java_process');

 var jp = java_process.config('ActuPlan.jar', '-h 0 -nbThreads 1 exemples/jail.apl exemples/jail-01.apl -simulatePlan', function() {
 jp.on('stdout', function(data) {
 console.log("Some message java sent through System.out: ", String(data));
 });
 jp.on('stderr', function(data) {
 console.log("Some message error: ", String(data));
 });

 jp.writeDataToProcess('Some message to input to java process');
 });

 jp.onDataOnStdOut('plop');
 java_process.checkJava();

 var exec = require('child_process').exec, child;
 child = exec('java -jar ActuPlan.jar -h 0 -nbThreads 1 exemples/jail.apl exemples/jail-01.apl -simulatePlan',
 function (error, stdout, stderr){
 console.log('stdout: ' + stdout);
 //console.log('stderr: ' + stderr);
 if(error !== null){
 console.log('exec error: ' + error);
 }
 });*/