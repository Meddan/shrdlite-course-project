var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PlannerTextWorld = (function (_super) {
    __extends(PlannerTextWorld, _super);
    function PlannerTextWorld(currentState, relation, object, subject) {
        _super.call(this, currentState);
        this.currentState = currentState;
        this.relation = relation;
        this.object = object;
        this.subject = subject;
    }
    PlannerTextWorld.prototype.leftClone = function () {
        if (this.currentState.arm <= 0) {
            throw "already at edge!";
        }
        var newWorld = this.currentState;
        newWorld.arm--;
        return new PlannerTextWorld(newWorld, this.relation, this.object, this.subject);
    };
    PlannerTextWorld.prototype.rightClone = function () {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "already at edge!";
        }
        var newWorld = this.currentState;
        newWorld.arm++;
        return new PlannerTextWorld(newWorld, this.relation, this.object, this.subject);
    };
    PlannerTextWorld.prototype.pickClone = function () {
        if (this.currentState.holding) {
            throw "already holding something";
        }
        var newWorld = this.currentState;
        var stack = newWorld.arm;
        var pos = newWorld.stacks[stack].length - 1;
        if (pos < 0) {
            throw "Stack is empty!";
        }
        newWorld.holding = newWorld.stacks[stack].pop();
        return new PlannerTextWorld(newWorld, this.relation, this.object, this.subject);
    };
    PlannerTextWorld.prototype.dropClone = function () {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var newWorld = this.currentState;
        var stack = newWorld.arm;
        var holding = newWorld.holding;
        if (newWorld.stacks[stack] == []) {
            if (this.allowedPhysics(holding, "floor", "ontop", newWorld)) {
                newWorld.stacks[stack].push(newWorld.holding);
                newWorld.holding = null;
                return new PlannerTextWorld(newWorld, this.relation, this.object, this.subject);
            }
            else {
                throw new Error("what is going on, can't place on floor");
            }
        }
        else {
            var topOfStack = newWorld.stacks[stack][-1];
            if (this.allowedPhysics(holding, topOfStack, "ontop", newWorld)) {
                newWorld.stacks[stack].push(newWorld.holding);
                newWorld.holding = null;
                return new PlannerTextWorld(newWorld, this.relation, this.object, this.subject);
            }
            else {
                throw new Error("We cannot drop here");
            }
        }
    };
    PlannerTextWorld.prototype.allowedPhysics = function (s, l, rel, state) {
        if (s == "floor") {
            return false;
        }
        if (l == "floor") {
            return (rel == "ontop" || rel == "above");
        }
        if (s == l) {
            return false;
        }
        if (rel == "beside" || rel == "leftof" || rel == "rightof") {
            return true;
        }
        var objectSize = state.objects[s].size;
        var targetSize = state.objects[l].size;
        var objectShape = state.objects[s].form;
        var targetShape = state.objects[l].form;
        if (rel == "under") {
            return !(objectShape == "ball" || (objectSize == "small" && targetSize == "large"));
        }
        if (objectSize == "large" && targetSize == "small") {
            return false;
        }
        if (targetShape == "ball") {
            return false;
        }
        if (rel != "above") {
            return this.allowedRelation(s, l, state);
        }
        return true;
    };
    PlannerTextWorld.prototype.allowedRelation = function (s, l, state) {
        var objectSize = state.objects[s].size;
        var targetSize = state.objects[l].size;
        var objectShape = state.objects[s].form;
        var targetShape = state.objects[l].form;
        if (targetShape == "box") {
            if (objectShape == "pyramid" || objectShape == "box" || objectShape == "plank") {
                if (!(targetSize == "large" && objectSize == "small")) {
                    return false;
                }
            }
        }
        if (objectShape == "ball" && !(targetShape == "floor" || targetShape == "box")) {
            return false;
        }
        if (objectShape == "box" && objectSize == "small") {
            if (targetSize == "small" && (targetShape == "pyramid" || targetShape == "brick")) {
                return false;
            }
        }
        if (objectSize == "large" && objectShape == "box") {
            return !(targetShape == "pyramid");
        }
        return true;
    };
    return PlannerTextWorld;
}(TextWorld));
