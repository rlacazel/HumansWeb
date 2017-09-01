var attribute_data = [ // The data
    [
        ['blood left leg:is-bloodstain-left-leg','blood left arm:is-bloodstain-left-arm','blood left chest:is-bloodstain-left-chest',
            'blood right leg:is-bloodstain-right-leg','blood right arm:is-bloodstain-right-arm','blood right chest:is-bloodstain-right-chest',
            'grumble:is-grumbling','breath:is-breathing'],
        ['0','0.5','1'],
        ['Patient']
    ],
    [
        ['wound:is-wounded'],
        ['1','2','3','1;2','2;3','1;3','1;2;3'],
        ['Patient']
    ],
    [
        ['open:is-open'],
        ['true','false'],
        ['Case']
    ],
    [
        ['blood hand:has-blooded-hands'],
        ['true','false'],
        ['Nurse']
    ]
];

jQuery(function($){

// ------------------------
// ---- GotoAndAnimate -----
// ------------------------
    var data = [ // The data
        ['check', [
            'head','leg','chest'
        ]],
        ['cut', [
            'rleg', 'lleg', 'chest'
        ]],
        ['apply', [
            'rleg','lleg','rarm','larm','lchest','rchest'
        ]]
    ];


    $a = $('#action'); // The dropdowns
    $b = $('#part');

    for(var i = 0; i < data.length; i++) {
        var first = data[i][0];
        $a.append($("<option>"). // Add options
        attr("value",first).
        data("sel", i).
        text(first));
    }

    $a.change(function() {
        var index = $(this).children('option:selected').data('sel');
        var second = data[index][1]; // The second-choice data

        $b.html(''); // Clear existing options in second dropdown

        for(var j = 0; j < second.length; j++) {
            $b.append($("<option>"). // Add options
            attr("value",second[j]).
            data("sel", j).
            text(second[j]));
        }
    }).change(); // Trigger once to add options at load of first choice

// ------------------------
// ---- Attribute -----
// ------------------------



    $at = $('#attr'); // The dropdowns
    $va = $('#attr_value');
    $ob = $('#attr_object');

    for(var i = 0; i < attribute_data.length; i++) {
        var first = attribute_data[i][0];
        for(var j = 0; j < first.length; j++)
        {
            var splitted_data = first[j].split(':');
            $at.append($("<option>").// Add options
            attr("value", splitted_data[1]).data("sel", i).text(splitted_data[0]));
        }
    }

    $at.change(function() {
        var index = $(this).children('option:selected').data('sel');
        var second = attribute_data[index][1]; // The second-choice data

        $va.html(''); // Clear existing options in second dropdown

        for(var j = 0; j < second.length; j++) {
            $va.append($("<option>").
            attr("value",second[j]).
            data("sel", j).
            text(second[j]));
        }

        var third = attribute_data[index][2]; // The second-choice data

        $ob.html(''); // Clear existing options in second dropdown

        for(var j = 0; j < third.length; j++) {
            $ob.append($("<option>"). // Add options
            // attr("id","uri").
            attr("value",third[j]).
            data("sel", j).
            text(third[j]));
        }
    }).change(); // Trigger once to add options at load of first choice


// ------------------------
// ---- Buttons -----
// ------------------------
    $("button").click(function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/action",
            data: {
                id: $(this).attr('name'), // < note use of 'this' here
                nurse: $('#nurse').val(),
                action: $('#action').val(),
                part: $('#part').val(),
                victim: $('#victim').val(),
                nurse_take: $('#nurse_take').val(),
                object_take: $('#uri_object_take').val(),
                attr: $('#attr').val(),
                attr_value: $('#attr_value').val(),
                attr_object: $('#attr_object').val()
            },
            success: function(result) {
                // alert('ok');
            },
            error: function(result) {
                // alert('error');
            }
        });
    });


    function addEntry(txt)
    {
        var list = d3.select("#storylinelist");
        list.append('li').text(txt);
    }

    var timer = new Timer();
    var graph, gd;

    var socket = io.connect('http://localhost:3700');
    socket.on('js_client', function (msg) {
        console.log(msg);
        var res = msg.data.toString().split(':');
        var core_msg = msg.data.toString().replace(res[0]+':','').trim();
        if (res[0]=='action')
        {
            addEntry(core_msg);
        }
        else if (res[0]=='uritype')
        {
            var pair_uri_type = core_msg.split('@');
            var dict = {};
            for (i = 0; i < pair_uri_type.length; i++)
            {
                var ury_type = pair_uri_type[i].split(':');
                if(!(ury_type[1] in dict))
                {
                    dict[ury_type[1]] = [];
                }
                dict[ury_type[1]].push(ury_type[0]);
            }
            $("option[id='uri']").each(function (i, el) {
                var values = $(this).attr("value");
                var value_splitted = values.split(":");
                var select = $(this).parent();
                select.html('');
                for (i = 0; i < value_splitted.length; i++) {
                    var uris = dict[value_splitted[i]];
                    for (j = 0; j < uris.length; j++) {
                        select.append($("<option></option>")
                            .attr("value", uris[j]).data("sel", 0).text(uris[j]));
                    }
                }
            });

            // Update data with instances
            for (i = 0; i < attribute_data.length; i++)
            {
                var list_type = attribute_data[i][2];
                attribute_data[i][2] = [];
                for (j = 0; j < list_type.length; j++)
                {
                    var uris = dict[list_type[j]];
                    for (k = 0; k < uris.length; k++)
                    {
                        attribute_data[i][2].push(uris[k]);
                    }
                }
            }

            // Trigger a change to refresh
            $at = $('#attr'); // The dropdowns
            $at.change();
        }
        else if (res[0]=='error')
        {
            d3.select("#error_msg").text(core_msg);
        }
        else if (res[0]=='trigger')
        {
            gd.color_node_by_id(res[1]);
            if (res[1] == 0) // TODO: stop adding hardcode
            {
                timer.start();
                // gd.color_node_by_id(2); // TO REMOVE
                replaceLinesWithPaths('#treesvg');
            }
        }
        else if (res[0]=='ack') // humans -> js_server -> here
        {
            // convert to plan string and put it in green if present
            if(res[1]=='success')
            {
                gd.color_node_by_label(res[2].trim());
            }
        }
        else if (res[0]=='timer')
        {
            startSVGAnimation($('#treesvg'),res[2],res[1]);
        }
        else if (res[0]=='graph')
        {
            // plan receive from server:
            // Reset scenario and remove previous plan before to redraw new one
            timer.stop();
            $('#treesvg').remove();
            graph = graphlib.json.read(JSON.parse(core_msg));
            gd = new graph_drawer(graph, "#treeplan");
            gd.draw();
        }
    });

    timer.addEventListener('secondsUpdated', function (e) {
        $('#storyline .values').html(timer.getTimeValues().toString());
    });
    timer.addEventListener('started', function (e) {
        $('#storyline .values').html(timer.getTimeValues().toString());
    });
});

// radial timer : https://codepen.io/anon/pen/yoqYQV