var StateNode = (function () {
    function StateNode(state) {
        this.state = state;
    }
    StateNode.prototype.add = function (action) {
        return null;
    };
    StateNode.prototype.compareTo = function (other) {
        return 0;
    };
    StateNode.prototype.toString = function () {
        return this.state.currentState.toString();
    };
    return StateNode;
}());
var StateGraph = (function () {
    function StateGraph(startingState) {
    }
    StateGraph.prototype.outgoingEdges = function (node) {
        var outgoing = [];
        var newNode;
        try {
            newNode = new StateNode(node.state.leftClone());
            outgoing.push({
                from: node,
                to: newNode,
                cost: 1
            });
        }
        catch (Error) { }
        try {
            newNode = new StateNode(node.state.rightClone());
            outgoing.push({
                from: node,
                to: newNode,
                cost: 1
            });
        }
        catch (Error) { }
        try {
            newNode = new StateNode(node.state.pickClone());
            outgoing.push({
                from: node,
                to: newNode,
                cost: 1
            });
        }
        catch (Error) { }
        try {
            newNode = new StateNode(node.state.dropClone());
            outgoing.push({
                from: node,
                to: newNode,
                cost: 1
            });
        }
        catch (Error) { }
        return outgoing;
    };
    StateGraph.prototype.compareNodes = function (a, b) {
        return a.compareTo(b);
    };
    StateGraph.prototype.toString = function (start, goal, path) {
        return "nope";
    };
    StateGraph.prototype.heuristic = function (node) {
        var plannerState = node.state;
        var currentState = plannerState.currentState;
        var literal = plannerState.formula[0][0];
        var r = literal.relation;
        if (r == "holding") {
            return 0;
        }
        var object = literal.args[0];
        var subject = literal.args[1];
        var distance = this.findDistance(currentState, object, subject);
        if (r == "ontop" || r == "inside" || r == "above" || r == "under") {
            return Math.abs(distance);
        }
        else if (r == "beside") {
            return Math.abs(distance) - 1;
        }
        else if (r == "rightof") {
            if (distance < 0) {
                return Math.abs(distance) + 1;
            }
            else if (distance > 0) {
                return 0;
            }
        }
        else if (r == "leftof") {
            if (distance < 0) {
                return 0;
            }
            else if (distance > 0) {
                return Math.abs(distance) + 1;
            }
        }
        return 0;
    };
    StateGraph.prototype.findStackPos = function (state, obj) {
        var stack = state.stacks[this.findStackNbr(state, obj)];
        for (var i = 0; i < stack.length; i++) {
            if (stack[i] == obj) {
                return stack.length - 1 - i;
            }
        }
        return 0;
    };
    StateGraph.prototype.findStackNbr = function (state, obj) {
        var stacks = state.stacks;
        for (var i = 0; i < stacks.length; i++) {
            if (stacks[i].indexOf(obj) != -1) {
                return i;
            }
        }
        return -1;
    };
    StateGraph.prototype.findDistance = function (state, obj, subj) {
        if (state.holding == obj) {
            return state.arm - this.findStackNbr(state, subj);
        }
        else if (state.holding == subj) {
            return this.findStackNbr(state, obj) - state.arm;
        }
        return this.findStackNbr(state, obj) - this.findStackNbr(state, subj);
    };
    return StateGraph;
}());
