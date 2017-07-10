jQuery(function($){

$("button").click(function(e) {
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
});

});
/*
jQuery(function($){

    var socket = io.connect('http://localhost:3700');
    socket.on('refresh_client', function (msg) {
        console.log(msg);
        //$('#button_1').prop('name', 'Save');
        //$("#button_1").load(location.href + " #button_1");
    });

});
*/
jQuery(function($){

    function tree(){
        var svgW=958, svgH =460, xRadius=30, yRadius=18, tree={cx:300, cy:30, w:100, h:70};
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

            var circles = d3.select("#g_circles").selectAll('ellipse').data(tree.getVertices());

            circles.transition().duration(500).attr('cx',function(d){ return d.p.x;}).attr('cy',function(d){ return d.p.y;});

            circles.enter().append('ellipse').attr('cx',function(d){ return d.f.p.x;}).attr('cy',function(d){ return d.f.p.y;}).attr('rx',xRadius).attr('ry',yRadius)
                .attr("stroke", "black").attr("fill", function(d){ return tree.getColorNode(d)}).on('click',function(d){return tree.addLeaf(d.v);})
                .transition().duration(500).attr('cx',function(d){ return d.p.x;}).attr('cy',function(d){ return d.p.y;});

            var labels = d3.select("#g_labels").selectAll('text').data(tree.getVertices());

            labels.text(function(d){return d.l;}).transition().duration(500)
                .attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y+5;});

            labels.enter().append('text').attr('x',function(d){ return d.f.p.x;}).attr('y',function(d){ return d.f.p.y+5;})
                .text(function(d){return d.l;}).on('click',function(d){return tree.addLeaf(d.v);})
                .transition().duration(500)
                .attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y+5;});

            var elabels = d3.select("#g_elabels").selectAll('text').data(tree.getEdges());

            elabels
                .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
                .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});

            elabels.enter().append('text')
                .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
                .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});
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
                reposition(d);
            });
        }

        initialize = function(){
            d3.select("#tree").append("svg").attr("width", svgW).attr("height", svgH).attr('id','treesvg');

            d3.select("#treesvg").append('g').attr('id','g_lines').selectAll('line').data(tree.getEdges()).enter().append('line')
                .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
                .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;});

            d3.select("#treesvg").append('g').attr('id','g_circles').selectAll('ellipse').data(tree.getVertices()).enter()
                .append('ellipse').attr('cx',function(d){ return d.p.x;}).attr('cy',function(d){ return d.p.y;}).attr('rx',xRadius).attr('ry',yRadius)
                .attr("stroke", "black").attr("fill", function(d){ return tree.getColorNode(d)}).on('click',function(d){return tree.addLeaf(d.v);});

            d3.select("#treesvg").append('g').attr('id','g_labels').selectAll('text').data(tree.getVertices()).enter().append('text')
                .attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y+5;}).text(function(d){return d.l;})
                .on('click',function(d){return tree.addLeaf(d.v);});

            d3.select("#treesvg").append('g').attr('id','g_elabels').selectAll('text').data(tree.getEdges()).enter().append('text')
                .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
                .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});
        }
        initialize();

        return tree;
    }
    var tree= tree();

    var node = 0;

    var socket = io.connect('http://localhost:3700');
    socket.on('js_client', function (msg) {
        console.log(msg);
        var res = msg.data.toString().split(':');
        if(res.length == 3 && res[0]=='action')
        {
            if (res[1] == 'triggered')
            {
                tree.addLeaf(node,res[2],'ongoing');
                node++;
            }
            else if (res[1] == 'ack_success')
            {
                // Retrieve the specified node, change its status and redraw
                // todo that: maintain an map of label to id or juste retrieve by label (need to be unique !)
            }
        }
    });

});