class PlannerTextWorld extends TextWorld {
    constructor(public currentState : WorldState) {
        super(currentState);
    }

    public leftClone() : WorldState {
        if (this.currentState.arm <= 0) {
            throw "already at edge!";
        }
        var newWorld : WorldState = this.currentState;
        newWorld.arm--;
        return newWorld;
    }

    public rightClone() : WorldState {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "already at edge!";
        }
        var newWorld : WorldState = this.currentState;
        newWorld.arm++;
        return newWorld;
    }

    public pickClone() : WorldState {
        if (this.currentState.holding) {
            throw "already holding something"
        }
        var newWorld : WorldState = this.currentState;
        var stack = newWorld.arm;
        var pos = newWorld.stacks[stack].length - 1;
        if (pos < 0) {
            throw "Stack is empty!";
        }
        newWorld.holding = newWorld.stacks[stack].pop();
        return newWorld;
    }

    public dropClone() : WorldState {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var newWorld : WorldState = this.currentState;
        var stack = newWorld.arm;
        newWorld.stacks[stack].push(newWorld.holding);
        newWorld.holding = null;
        return newWorld;
    }
}
