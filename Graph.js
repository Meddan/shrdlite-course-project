var Edge = (function () {
    function Edge() {
    }
    return Edge;
}());
var SearchResult = (function () {
    function SearchResult() {
    }
    return SearchResult;
}());
function aStarSearch(graph, start, goal, heuristics, timeout) {
    var result = {
        path: [start],
        cost: 0
    };
    var closedSet = new collections.Set();
    var openSet = new collections.Set();
    var cameFrom = new collections.Dictionary();
    var gScore = new collections.Dictionary();
    var fScore = new collections.Dictionary();
    openSet.add(start);
    fScore.setValue(start, heuristics(start));
    gScore.setValue(start, 0);
    while (openSet.size() != 0) {
        var lowF = Infinity;
        var current = null;
        for (var _i = 0, _a = openSet.toArray(); _i < _a.length; _i++) {
            var n = _a[_i];
            if (fScore.getValue(n) < lowF) {
                lowF = gScore.getValue(n);
                current = n;
            }
        }
        if (current == start) {
            console.log("WE START AT START");
        }
        if (goal(current)) {
            console.log("GOAL == CURRENT");
            var result_1 = new SearchResult();
            result_1.path = reconstruct_path(cameFrom, current);
            result_1.cost = gScore.getValue(current);
            return (result_1);
        }
        openSet.remove(current);
        closedSet.add(current);
        var listOfEdges = graph.outgoingEdges(current);
        for (var _b = 0, listOfEdges_1 = listOfEdges; _b < listOfEdges_1.length; _b++) {
            var e = listOfEdges_1[_b];
            console.log("FOR ALL neighbour");
            var n = e.to;
            if (!closedSet.contains(n)) {
                var tentative_gScore = lookup(gScore, current) + e.cost;
                if (!openSet.contains(n)) {
                    console.log("ADDING TO OPEN");
                    openSet.add(n);
                }
                else if (tentative_gScore < lookup(gScore, n)) {
                    console.log("found better path");
                    cameFrom.setValue(n, current);
                    gScore.setValue(n, tentative_gScore);
                    fScore.setValue(n, gScore.getValue(n) + heuristics(n));
                }
            }
        }
        console.log("END OF WHILE");
        console.log(openSet.size());
    }
    console.log("FAIL TO FIND");
    return null;
}
function lookup(dic, target) {
    console.log("LOOKUP");
    if (dic.containsKey(target)) {
        return dic.getValue(target);
    }
    else {
        return Infinity;
    }
}
function reconstruct_path(cameFrom, current) {
    var total_path = [current];
    var total_cost = 0;
    while (cameFrom.getValue(current) != null) {
        current = cameFrom.getValue(current);
        total_path.push(current);
    }
    return total_path;
}
var GridNode = (function () {
    function GridNode(pos) {
        this.pos = pos;
    }
    GridNode.prototype.add = function (delta) {
        return new GridNode({
            x: this.pos.x + delta.x,
            y: this.pos.y + delta.y
        });
    };
    GridNode.prototype.compareTo = function (other) {
        return (this.pos.x - other.pos.x) || (this.pos.y - other.pos.y);
    };
    GridNode.prototype.toString = function () {
        return "(" + this.pos.x + "," + this.pos.y + ")";
    };
    return GridNode;
}());
var GridGraph = (function () {
    function GridGraph(size, obstacles) {
        this.size = size;
        this.walls = new collections.Set();
        for (var _i = 0, obstacles_1 = obstacles; _i < obstacles_1.length; _i++) {
            var pos = obstacles_1[_i];
            this.walls.add(new GridNode(pos));
        }
        for (var x = -1; x <= size.x; x++) {
            this.walls.add(new GridNode({ x: x, y: -1 }));
            this.walls.add(new GridNode({ x: x, y: size.y }));
        }
        for (var y = -1; y <= size.y; y++) {
            this.walls.add(new GridNode({ x: -1, y: y }));
            this.walls.add(new GridNode({ x: size.x, y: y }));
        }
    }
    GridGraph.prototype.outgoingEdges = function (node) {
        var outgoing = [];
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (!(dx == 0 && dy == 0)) {
                    var next = node.add({ x: dx, y: dy });
                    if (!this.walls.contains(next)) {
                        outgoing.push({
                            from: node,
                            to: next,
                            cost: Math.sqrt(dx * dx + dy * dy)
                        });
                    }
                }
            }
        }
        return outgoing;
    };
    GridGraph.prototype.compareNodes = function (a, b) {
        return a.compareTo(b);
    };
    GridGraph.prototype.toString = function () {
        var borderRow = "+" + new Array(this.size.x + 1).join("--+");
        var betweenRow = "+" + new Array(this.size.x + 1).join("  +");
        var str = "\n" + borderRow + "\n";
        for (var y = this.size.y - 1; y >= 0; y--) {
            str += "|";
            for (var x = 0; x < this.size.x; x++) {
                str += this.walls.contains(new GridNode({ x: x, y: y })) ? "## " : "   ";
            }
            str += "|\n";
            if (y > 0)
                str += betweenRow + "\n";
        }
        str += borderRow + "\n";
        return str;
    };
    return GridGraph;
}());
