// https://www.npmjs.com/package/data-tree
var graph = require('graphlib');
var fs = require('fs');

module.exports = {

    build_graph: function()
    {
        var contents = fs.readFileSync('data/exemple.json', 'utf8');
        var g = graph.json.read(JSON.parse(contents));
        return g;
    },
    get_stringified_graph: function(g)
    {
        return graph.json.write(g);
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
            if(data.controlled == true && data.executed == false)
            {
                // It is a candidate, we know have to check if all its parents have been executed
                var is_all_parent_executed = true;
                for(var j = 0; j < parent_ids.length; j++)
                {
                    is_all_parent_executed = is_all_parent_executed && g.node(parent_ids[j]).executed;
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


// var tree = tree_module.CreateTree({id:0, label:"Start"});
/*var tree = datatree.create();
tree.insert({id: -1, label: "Start", controlled: true, delay: 0, executed: false});

var stack = [tree._rootNode];
var lbl_dict = {};
var time_dict = {};
var split = structure.split(/(?=[\[,])/);
// Save label
var split_lbl = label.split("@");
var number_lbl = split_lbl.length;
for (var i = 0; i < number_lbl; i++) {
    var id_and_lbl = split_lbl[i].split(":");
    lbl_dict[id_and_lbl[0]] = id_and_lbl[1];
}*/
// save time
/* var split_time = time.split("@");
 var number_time = split_time.length;
 for (var i = 0; i < number_time; i++)
 {
     var id_and_time = split_time[i].split(":");
     time_dict[id_and_time[0]] = id_and_time[1];
 }*/
/*var split_len = split.length;
for (var i = 0; i < split_len; i++) {
    if (split[i].startsWith(",")) {
        stack.pop();
    }
    var nbclosingbracket = split[i].split("]").length - 1;
    var value = parseInt(split[i].replace("[", "").replace("]", "").replace(",", ""));
    tree.insertToNode(stack[stack.length - 1], {id: value, label: lbl_dict[value], controlled: true, delay: 0, executed: false});
    stack.push(tree._currentNode);
    for (var j = 0, len = nbclosingbracket; j < len; j++) {
        stack.pop();
    }
}*/

/*tree.traverser().traverseBFS(function(node){
    console.log(node.data(), node.childNodes());
});*/