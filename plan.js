// https://www.npmjs.com/package/data-tree
var graph = require('graphlib');
var fs = require('fs');

module.exports = {

    build_graph: function()
    {
        var contents = fs.readFileSync('data/exemple2.json', 'utf8');
        var g = graph.json.read(JSON.parse(contents));
        return g;
    },
    get_stringified_graph: function(g)
    {
        return graph.json.write(g);
    },
    get_id_from_label: function(g, label)
    {
        var nodes = this.graph.nodes();
        for(var i = 0; i < nodes.length; i++)
        {
            if (this.graph.node(nodes[i]).label.startsWith(label)) {
                return i;
            }
        }
        return null;
    },
    get_next_nodes_to_execute: function(g)
    {
        var preorder_nodes = graph.alg.preorder(g, 0);
        var nodes = [];
        for(var i = 0; i < preorder_nodes.length; i++)
        {
            var node_id = preorder_nodes[i];
            var data = g.node(node_id);
            var parent_ids = g.predecessors(node_id);
            if(data.controlled == true && data.state == 'notstarted')
            {
                // It is a candidate, we know have to check if all its parents have been executed
                var is_all_parent_executed = true;
                for(var j = 0; j < parent_ids.length; j++)
                {
                    is_all_parent_executed = is_all_parent_executed && g.node(parent_ids[j]).state == 'executed';
                }
                // all the parents have been executed, so add it to result
                if (is_all_parent_executed) {
                    nodes.push(node_id);
                }
            }
        }
        nodes.sort(function(a, b) {
            return g.node(a).delay - g.node(b).delay;
        });
        if(nodes.length > 0) {
            return nodes[0];
        }
        return null;
    }
}