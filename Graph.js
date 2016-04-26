"use strict";
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
    var closedSet;
    var openSet = [start];
    var cameFrom = new Map();
    var gScore = new Map();
    var fScore = new Map();
    fScore.set(start, heuristics(start));
    gScore.set(start, 0);
    while (openSet.length != 0) {
        var lowF = Infinity;
        var current = null;
        for (var _i = 0, openSet_1 = openSet; _i < openSet_1.length; _i++) {
            var n = openSet_1[_i];
            if (fScore.get(n) < lowF) {
                lowF = gScore.get(n);
                current = n;
            }
        }
        if (goal(current)) {
        }
        var index = openSet.indexOf(current);
        if (index > -1) {
            openSet.splice(index, 1);
        }
        closedSet.push(current);
        var listOfEdges = graph.outgoingEdges(current);
        for (var _a = 0, listOfEdges_1 = listOfEdges; _a < listOfEdges_1.length; _a++) {
            var e = listOfEdges_1[_a];
            var n = e.to;
            if (closedSet.indexOf(n) == -1) {
                var tentative_gScore = gScore.get(current) + e.cost;
                if (openSet.indexOf(n) == -1) {
                    openSet.push(n);
                    fScore.set(n, Infinity);
                    gScore.set(n, Infinity);
                }
                else if (tentative_gScore < gScore.get(n)) {
                    cameFrom.set(n, current);
                    gScore.set(n, tentative_gScore);
                    fScore.set(n, gScore.get(n) + heuristics(n));
                }
            }
        }
    }
    return null;
}
function reconstruct_path(cameFrom, current) {
    if (cameFrom === void 0) { cameFrom = new Map(); }
    var total_path = [current];
    while (cameFrom.get(current) != null) {
        current = cameFrom.get(current);
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
