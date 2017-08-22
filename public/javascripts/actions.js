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
        'LUpperLegMiddle','RUpperLegMiddle','RUpperLegTop','LUpperLegTop'
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
/*$("button").click(function(e) {
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: "/action",
        data: {
            id: $(this).val(), // < note use of 'this' here
            //access_token: $("#access_token").val()
        },
        success: function(result) {
            // alert('ok');
        },
        error: function(result) {
            // alert('error');
        }
    });
});*/

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

});

jQuery(function($){

    function tree(div){
        var w = $(div).width();
        var svgH = 580, xRadius=130, yRadius=28, tree={cx:w/2, cy:30, w:175, h:70};
        // v: value node / l: label_node / P: position / c: child / status: none, ongoing, success, fail
        tree.vis={v:0, l:'Start', p:{x:tree.cx, y:tree.cy},c:[],status:'none'};
        tree.size=1;
        tree.glabels =[];

        // Store in v all nodes and return it as a list of {value, label, position, parent{value, position] }
        tree.getVertices =  function(){
            var v =[];
            function getVertices(t,f){
                v.push({v:t.v, l:t.l, p:t.p, f:f, status:t.status});
                t.c.forEach(function(d){ return getVertices(d,{v:t.v, p:t.p}); });
            }
            getVertices(tree.vis,{});
            return v.sort(function(a,b){ return a.v - b.v;});
        }

        tree.updateVerticeStatus =  function(lbl, newStatus){
            function updateVertice(t){
                if (t.l == lbl)
                {
                    t.status = newStatus;
                }
                else {
                    t.c.forEach(function (d) {
                        return updateVertice(d);
                    });
                }
            }
            updateVertice(tree.vis);
            redraw();
        }

        // get all edges of the forme {{v1:value1,l1:label1,p1:position1},{v2:value2,l2:label2,p2:position2}}
        tree.getEdges =  function(){
            var e =[];
            // _ is current node
            function getEdges(_){
                _.c.forEach(function(d){ e.push({v1:_.v, l1:_.l, p1:_.p, v2:d.v, l2:d.l, p2:d.p});});
                _.c.forEach(getEdges);
            }
            getEdges(tree.vis);
            return e.sort(function(a,b){ return a.v2 - b.v2;});
        }

        // add a leaf to the child param 'c' of the node input
        tree.addLeaf = function(parent,lbl,st){
            function addLeaf(t){
                if(t.v==parent){ t.c.push({v:tree.size++, l:lbl, p:{},c:[],status:st}); return; }
                t.c.forEach(function(parent){return addLeaf(parent);} );
            }
            addLeaf(tree.vis);
            reposition(tree.vis);
            redraw();
        }

        tree.updateStatus = function(label,new_status)
        {
            function updateStatus(t){
                if(t.l==label){ t.status=new_status; return; }
                t.c.forEach(function(parent){return updateStatus(parent);} );
            }
            updateStatus(tree.vis);
            redraw();
        }

        tree.getColorNode = function(node)
        {
            if (node.status=='none' || node.status=='ongoing')
            {
                return 'lightgrey';
            }
            else
            {
                return 'lightgreen';
            }
        }

        redraw = function(){
            var edges = d3.select("#g_lines").selectAll('line').data(tree.getEdges());

            edges.transition().duration(500)
                .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
                .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;})

            edges.enter().append('line')
                .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
                .attr('x2',function(d){ return d.p1.x;}).attr('y2',function(d){ return d.p1.y;})
                .transition().duration(500)
                .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;});

            var circles = d3.select("#g_circles").selectAll('rect').data(tree.getVertices());

            // Value whihc can change
            circles.transition().duration(500).attr('x',function(d){ return d.p.x-xRadius/2;}).attr('y',function(d){ return d.p.y-yRadius/2;}).attr("stroke", "black").attr("fill", function(d){ return tree.getColorNode(d)});

            // circles.enter().append('ellipse').attr('cx',function(d){ return d.f.p.x;}).attr('cy',function(d){ return d.f.p.y;}).attr('rx',xRadius).attr('ry',yRadius)
            circles.enter().append('rect').attr('x',function(d){ return d.f.p.x-xRadius/2;}).attr('y',function(d){ return d.f.p.y-yRadius/2;}).attr('width',xRadius).attr('height',yRadius)
                .attr("stroke", "black").attr("fill", function(d){ return tree.getColorNode(d)})//.on('click',function(d){return tree.addLeaf(d.v);})
                .transition().duration(500).attr('x',function(d){ return d.p.x-xRadius/2;}).attr('y',function(d){ return d.p.y-yRadius/2;});

            var labels = d3.select("#g_labels").selectAll('text').data(tree.getVertices());

            labels.enter().append("text")
                .each(function (d) {
                    var newstringreplaced = d.l.replace(/\(/gi, "@(");
                    var arr = newstringreplaced.split("@");
                    for (i = 0; i < arr.length; i++) {
                        d3.select(this)
                            .attr('x',d.f.p.x)
                            .attr('y',d.f.p.y+tree.h).attr('font-size',11)
                            .append("tspan").attr('x',function(d){ return d.f.p.x;}).attr('y',d.f.p.y-2)
                            .text(arr[i])
                            .attr("dy", i ? "1.2em" : 0)
                            .attr("text-anchor", "middle")
                    }
                });

            // already existing label
            labels.each(function (d) {
                        d3.select(this).transition().duration(500)
                            .attr('x', d.p.x).attr('y', d.p.y+5).attr('font-size', 11)
                            .selectAll("tspan").attr('x', d.p.x).attr('y', d.p.y-2);
                });

            /*labels.each(function (d) {
                    var newstringreplaced = d.l.replace(/\(/gi, "@(");
                    var arr = newstringreplaced.split("@");
                        d3.select(this).selectAll('tspan').each(function (d)
                        {
                            d3.select(this).transition().duration(500).text(arr[i]).attr('x', d.p.x).attr('y', d.p.y + 5).attr('font-size', 12);
                        }).transition().duration(500)
                });*/

            /*labels.enter().append('text').attr('x',function(d){ return d.f.p.x;}).attr('y',function(d){ return d.f.p.y+5;}).attr('font-size',12)
                .text(function(d){return d.l;}).on('click',function(d){return tree.addLeaf(d.v);})
                .transition().duration(500)
                .attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y+5;});*/



            var elabels = d3.select("#g_elabels").selectAll('text').data(tree.getEdges());

            elabels
                .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
                .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});

            elabels.enter().append('text')
                .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
                .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});

            // Resize  svg height if higher
            d3.select("#treesvg").attr("height", svgH);
        }

        getLeafCount = function(_){
            if(_.c.length ==0) return 1;
            else return _.c.map(getLeafCount).reduce(function(a,b){ return a+b;});
        }

        reposition = function(v){
            var lC = getLeafCount(v), left=v.p.x - tree.w*(lC-1)/2;
            v.c.forEach(function(d){
                var w =tree.w*getLeafCount(d);
                left+=w;
                d.p = {x:left-(w+tree.w)/2, y:v.p.y+tree.h};
                svgH = Math.max(svgH, v.p.y+tree.h+tree.h/2);
                reposition(d);
            });
        }

        initialize = function(div){
            d3.select(div).append("svg").attr("width", "100%").attr("height", svgH).attr('id','treesvg');

            d3.select("#treesvg").append('g').attr('id','g_lines').selectAll('line').data(tree.getEdges()).enter().append('line')
                .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
                .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;});

            d3.select("#treesvg").append('g').attr('id','g_circles').selectAll('rect').data(tree.getVertices()).enter()
                .append('rect').attr('x',function(d){ return d.p.x-xRadius/2;}).attr('y',function(d){ return d.p.y-yRadius/2;}).attr('width',xRadius).attr('height',yRadius)
                .attr("stroke", "black").attr("fill", function(d){ return tree.getColorNode(d)});//.on('click',function(d){return tree.addLeaf(d.v);});

            d3.select("#treesvg").append('g').attr('id','g_labels').selectAll('text').data(tree.getVertices()).enter().append('text')
                .attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y+5;}).text(function(d){return d.l;}).attr('font-size',12);
                //.on('click',function(d){return tree.addLeaf(d.v);});

            d3.select("#treesvg").append('g').attr('id','g_elabels').selectAll('text').data(tree.getEdges()).enter().append('text')
                .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;}).attr('font-size',12)
                .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});
        }
        initialize(div);

        return tree;
    }

    function build_plan(tree, structure, lbl)
    {
        var stack = [0];
        var node=0;
        var lbl_dict = {};
        var split = structure.split(/(?=[\[,])/);
        var split_lbl = lbl.split("@");
        var split_len_lbl = split_lbl.length;
        for (var i = 0; i < split_len_lbl; i++)
        {
            var id_lbl = split_lbl[i].split(":");
            lbl_dict[id_lbl[0]] = id_lbl[1];
        }
        var split_len = split.length;
        for (var i = 0; i < split_len; i++)
        {
            if(split[i].startsWith(","))
            {
                stack.pop();
            }
            var nbclosingbracket = split[i].split("]").length-1;
            var value = parseInt(split[i].replace("[","").replace("]","").replace(",",""));
            tree.addLeaf(stack[stack.length-1],lbl_dict[value],'ongoing');
            stack.push(++node);
            for(var j = 0, len = nbclosingbracket; j < len; j++)
            {
                stack.pop();
            }
        }
    }

    function addEntry(txt)
    {
        var list = d3.select("#storylinelist");
        list.append('li').text(txt);
    }

    var treeplan= tree("#treeplan");
    var node = 0;
    build_plan(treeplan,"[0[2[3]],1[4]]", "0:CommitStateInjury(i2,unknown,good)@1:Take(n2,g2)@2:VictNotBreathing(i2,good,v2)@3:VictDie(i2,good,v2)@4:Apply(n2,g2,v1,i1)");

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
            treeplan.updateStatus('Start','success');
        }
        else if (res[0]=='ack') // humans -> js_server -> here
        {
            // convert to plan string and put it in green if present
            if(res[1]=='success')
            {
                treeplan.updateStatus(res[2],'success');
            }
        }
    });

});