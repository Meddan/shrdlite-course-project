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
    var startTime = new Date().getTime();
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
            if (lookup(fScore, n) <= lowF) {
                lowF = lookup(gScore, n);
                current = n;
            }
        }
        if (goal(current)) {
            var result_1 = new SearchResult();
            result_1.path = reconstruct_path(cameFrom, current).reverse();
            result_1.cost = gScore.getValue(current);
            return (result_1);
        }
        openSet.remove(current);
        closedSet.add(current);
        var listOfEdges = graph.outgoingEdges(current);
        for (var _b = 0, listOfEdges_1 = listOfEdges; _b < listOfEdges_1.length; _b++) {
            var e = listOfEdges_1[_b];
            var n = e.to;
            if (closedSet.contains(n)) {
                continue;
            }
            var tentative_gScore = lookup(gScore, current) + e.cost;
            if (!openSet.contains(n)) {
                openSet.add(n);
            }
            else if (tentative_gScore >= lookup(gScore, n)) {
                continue;
            }
            cameFrom.setValue(n, current);
            gScore.setValue(n, tentative_gScore);
            fScore.setValue(n, gScore.getValue(n) + heuristics(n));
        }
        var endTime = new Date().getTime();
        if (endTime - startTime >= 1000 * timeout) {
            break;
        }
    }
    return null;
}
function lookup(dic, target) {
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
