class PlannerTextWorld extends TextWorld {

    constructor(public currentState : WorldState,
      public formula : Interpreter.DNFFormula) {
        super(currentState);
    }

    public leftClone() : PlannerTextWorld {
        if (this.currentState.arm <= 0) {
            throw "already at edge!";
        }
        var newWorld : WorldState = this.currentState;
        newWorld.arm--;
        return new PlannerTextWorld(newWorld, this.formula);
    }

    public rightClone() : PlannerTextWorld {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "already at edge!";
        }
        var newWorld : WorldState = this.currentState;
        newWorld.arm++;
        return new PlannerTextWorld(newWorld, this.formula);
    }

    public pickClone() : PlannerTextWorld {
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
        return new PlannerTextWorld(newWorld,this.formula);
    }

    public dropClone() : PlannerTextWorld {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var newWorld : WorldState = this.currentState;
        var stack = newWorld.arm;
        newWorld.stacks[stack].push(newWorld.holding);
        newWorld.holding = null;
        return new PlannerTextWorld(newWorld, this.formula);
    }
}
