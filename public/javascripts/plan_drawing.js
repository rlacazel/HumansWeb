
function graph_drawer(g, d)
{
    this.graph = g;
    this.width = $(d).width();
    this.div = d;
    this.svgH = 580, this.xRadius=130, this.yRadius=28, this.tree={cx:this.width/2, cy:30, w:175, h:70};

    this.get_leaf_count = function (node) {
        var succ = this.graph.successors(node);
        if(succ.length == 0) return 1;
        else
        {
            var count = 0;
            for (var i = 0; i < succ.length; i++)
            {
                count += this.get_leaf_count(succ[i]);
            }
        }
        return count;
    };

    this.position = function()
    {
        this.graph.node(0).p = {x:this.tree.cx, y:this.tree.cy};
        this.positionne_node(0);
    }

    this.positionne_node = function(node_id)
    {
        var node = this.graph.node(node_id);
        var lC = this.get_leaf_count(node_id), left=node.p.x - this.tree.w*(lC-1)/2;
        var succ = this.graph.successors(node_id);
        for (var i = 0; i < succ.length; i++)
        {
            var w = this.tree.w*this.get_leaf_count(succ[i]);
            left+=w;
            var node_succ = this.graph.node(succ[i]);
            node_succ.p = {x:left-(w+this.tree.w)/2, y:node.p.y+this.tree.h};
            this.svgH = Math.max(this.svgH, node.p.y+this.tree.h+this.tree.h/2);
            this.positionne_node(succ[i]);
        }
    }

    this.color_node_by_id = function(node_id)
    {
        this.graph.node(node_id).executed = true;
        this.redraw();
    }

    this.color_node_by_label = function(node_label)
    {
        var nodes = this.graph.nodes();
        for(var i = 0; i < nodes.length; i++)
        {
            if (this.graph.node(nodes[i]).label.startsWith(node_label))
            {
                this.color_node_by_id(nodes[i]);
                return;
            }
        }
    }

    this.get_color_node = function(node_id)
    {
        if (!this.graph.node(node_id).executed)
        {
            return 'lightgrey';
        }
        else
        {
            return 'lightgreen';
        }
    }

    this.get_color_stroke = function(node_id)
    {
        if (!this.graph.node(node_id).executed)
        {
            return 'grey';
        }
        else
        {
            return 'green';
        }
    }

    this.get_durative_edges = function()
    {
        var durative_edges = [];
        var edges = this.graph.edges();
        for (var i = 0; i < edges.length; i++)
        {
            if (this.graph.node(edges[i].w).controlled)
            {
                durative_edges.push(edges[i]);
            }
        }
        return durative_edges;
    }

    this.get_color_edge = function(node_w)
    {
        var in_green = false;
        if (this.graph.node(node_w).executed)
        {
            in_green = true;
            var inedges = this.graph.inEdges(node_w);
            for (var i = 0; i < inedges.length; i++)
            {
                if (this.graph.node(inedges[i].v).executed != true)
                {
                    in_green = false;
                }
            }
        }

        return in_green ? 'green': 'lightgrey';
    }

    this.redraw = function()
    {
        var drawer = this;

        // Update rectangle color
        var rectangles = d3.select("#g_rectangles").selectAll('rect').data(drawer.graph.nodes());
        rectangles.transition().duration(500).attr('x',function(d){ return drawer.graph.node(d).p.x-drawer.xRadius/2;})
            .attr('y',function(d){ return drawer.graph.node(d).p.y-drawer.yRadius/2;})
            .attr("stroke", function(d){ return drawer.get_color_stroke(d)}).attr("fill", function(d){ return drawer.get_color_node(d)});

        var lines = d3.select("#g_lines").selectAll('line').data(drawer.graph.edges());
        lines.transition().duration(500).attr('x1',function(d){ return drawer.graph.node(d.v).p.x;}).attr('y1',function(d){ return drawer.graph.node(d.v).p.y+drawer.tree.cy/2;})
            .attr('x2',function(d){ return drawer.graph.node(d.w).p.x;}).attr('y2',function(d){ return drawer.graph.node(d.w).p.y-drawer.tree.cy/2;})
            .attr("stroke", function(d){ return drawer.get_color_edge(d.w) });
    }

    this.draw = function()
    {
        this.position();

        var drawer = this;

        d3.select(this.div).append("svg").attr("width", "100%").attr("height", this.svgH).attr('id','treesvg');

        d3.select("#treesvg").append('g').attr('id','g_lines').selectAll('line').data(drawer.graph.edges()).enter().append('line')
            .attr('x1',function(d){ return drawer.graph.node(d.v).p.x;}).attr('y1',function(d){ return drawer.graph.node(d.v).p.y+drawer.tree.cy/2;})
            .attr('x2',function(d){ return drawer.graph.node(d.w).p.x;}).attr('y2',function(d){ return drawer.graph.node(d.w).p.y-drawer.tree.cy/2;})
            .attr("stroke", function(d){ return drawer.get_color_edge(d.w) });

        d3.select("#treesvg").append('g').attr('id','g_lines_timer').selectAll('line').data(drawer.get_durative_edges()).enter().append('line')
            .attr('x1',function(d){ return drawer.graph.node(d.v).p.x;}).attr('y1',function(d){ return drawer.graph.node(d.v).p.y+drawer.tree.cy/2;})
            .attr('x2',function(d){ return drawer.graph.node(d.w).p.x;}).attr('y2',function(d){ return drawer.graph.node(d.w).p.y-drawer.tree.cy/2;})
            .attr("stroke", "lightgrey").attr('id',function(d){ return d.w;});

        d3.select("#treesvg").append('g').attr('id','g_rectangles').selectAll('rect').data(drawer.graph.nodes()).enter()
            .append('rect').attr('x',function(d){ return drawer.graph.node(d).p.x-drawer.xRadius/2;}).attr('y',function(d){ return drawer.graph.node(d).p.y-drawer.yRadius/2;})
            .attr('width',drawer.xRadius).attr('height',drawer.yRadius)
            .attr("stroke", "grey").attr("fill", function(d){ return drawer.get_color_node(d)});

        d3.select("#treesvg").append('g').attr('id','g_labels').selectAll('text').data(drawer.graph.nodes()).enter().append('text')
            .each(function (d) {
                var node = drawer.graph.node(d);
                var newstringreplaced = node.label.replace(/\(/gi, "@(");
                var arr = newstringreplaced.split("@");
                for (i = 0; i < arr.length; i++) {
                    d3.select(this)
                        .attr('x',node.p.x)
                        .attr('y',node.p.y+drawer.tree.h).attr('font-size',11)
                        .append("tspan").attr('x',node.p.x).attr('y',node.p.y-2)
                        .text(arr[i])
                        .attr("dy", arr.length == 1 ? "0.6em" : (i ? "1.2em" : 0))
                        .attr("text-anchor", "middle")
                }
            });
    }
}