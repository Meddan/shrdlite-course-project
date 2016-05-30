/// <reference path="./TextWorld.ts"/>
///<reference path="Interpreter.ts"/>
class PlannerTextWorld extends TextWorld {
    constructor(public currentState : WorldState, public formula : Interpreter.DNFFormula) {
        super(currentState);
        // Text world deletes holding in constructor
    }

    public isGoal() : boolean {

      // Go through all conjunctions
      for(var i = 0; i < this.formula.length; i++){
        // Get current conjunction
        var currentConjunction : Interpreter.Literal[] = this.formula[i];

        var correctLiterals = 0;
        //Go through all literals in conjunction
        for(var j = 0; j < currentConjunction.length; j++){
            // Get current literal
            var currentLiteral : Interpreter.Literal = currentConjunction[j];

            var pol : boolean = currentLiteral.polarity;
            var rel : string = currentLiteral.relation;
            var args : string[] = currentLiteral.args;
            var wStacks = this.currentState.stacks;

            if(rel != "holding" &&
                (args[0] == this.currentState.holding
                || args[1] == this.currentState.holding)){
                break;
            }

            if(rel == "inside"){
                var stack = this.findStacks(args[1], wStacks);
                // If the object above in the stack matches the object that
                // should be inside AND that bool matches the polarity, we all good
                if(!((stack[stack.indexOf(args[1]) + 1]) == (args[0])) == (pol)){
                    break;
                }
            } else if(rel == "ontop"){
                var stack = this.findStacks(args[0], wStacks);
                if(args[1] == "floor"){
                    // Check if thingy is on floor
                    if(!(stack.indexOf(args[0]) == 0) == pol){
                        break;
                    }
                } else {
                  // If args[0] is above args[1] or in stack, we all good
                  if(!((stack[stack.indexOf(args[1]) + 1]) == (args[0])) == (pol)
                    || stack.indexOf(args[1]) == -1){
                    break;
                  }
                }
            } else if (rel == "under") {
                var stack = this.findStacks(args[1], wStacks);

                // If args[0] is below args[1] or actually is in stack, we all good
                if(!(stack.indexOf(args[0]) < stack.indexOf(args[1])) == (pol)
                    || (stack.indexOf(args[0]) == -1)){
                    break;
                }
            } else if (rel == "above") {
                var stack = this.findStacks(args[1], wStacks);

                // If args[0] is above args[1] or actually is in stack, we all good
                if(!(stack.indexOf(args[0]) > stack.indexOf(args[1])) == (pol)
                    || (stack.indexOf(args[0]) == -1)){
                    break;
                }
            } else if (rel == "beside") {
                var stack = this.findStacks(args[1], wStacks);

                // Using ternary magic
                // If the index of the stack to the right of args[1] is equal to
                // the length of the list of stacks, args[0] cannot be to the
                // right of it and thus returns false, otherwise it checks the
                // stack to the right to see if it contains args[0]
                //
                // Works similarily for stacks to the left
                //
                // Only if both of these are false do we break, otherwise we gucci
                if(!(((wStacks.indexOf(stack) + 1) == wStacks.length ?
                        false :
                        wStacks[wStacks.indexOf(stack) + 1].indexOf(args[0]) != -1)
                        == pol
                    || ((wStacks.indexOf(stack) - 1) == -1 ?
                        false :
                        wStacks[wStacks.indexOf(stack) - 1].indexOf(args[0]) != -1)
                        == pol)
                        ) {
                        break;
                    }

            } else if (rel == "leftof"){
                var stack = this.findStacks(args[1], wStacks);
                var otherStack = this.findStacks(args[0], wStacks);

                // If args[0] is in stack to left of args[1]
                if(!(wStacks.indexOf(stack) > wStacks.indexOf(otherStack)) == pol){
                    break;
                }

            } else if (rel == "rightof"){
                var stack = this.findStacks(args[1], wStacks);
                var otherStack = this.findStacks(args[0], wStacks);

                // If args[0] is in stack to right of args[1]
                if(!(wStacks.indexOf(stack) < wStacks.indexOf(otherStack)) == pol){
                    break;
                }
            } else if (rel == "holding"){
                if(!(this.currentState.holding == args[0]) == pol){
                    break;
                }
            }

            correctLiterals++;

        } // End literal loop

        if(correctLiterals == currentConjunction.length){
            return true;
        }
      }

      return false;
    }

    // Find and return all stacks that contain provided entity
    private findStacks (ent : string, stacks : string[][]) : string[]{
      var returnArray : string[][] = [];

      // Go through all stacks
      for(var i = 0; i < stacks.length; i++){
        // If a stack contains the provided entity
        if(stacks[i].indexOf(ent) != -1) {
          // Add the stack to the array of matching stacks
          return stacks[i];
        }
      }
      // This should never happen as we always get
      throw new Error("No matching stack");

    }
    public leftClone() : PlannerTextWorld {
        if (this.currentState.arm <= 0) {
            throw "already at edge!";
        }
        var newWorld : WorldState = cloneWorldState(this.currentState);
        newWorld.arm--;
        return new PlannerTextWorld(newWorld, this.formula);
    }

    public rightClone() : PlannerTextWorld {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "already at edge!";
        }
        var newWorld : WorldState = cloneWorldState(this.currentState);
        newWorld.arm++;
        return new PlannerTextWorld(newWorld, this.formula);
    }

    public pickClone() : PlannerTextWorld {
        if (this.currentState.holding) {
            throw "already holding something"
        }
        var newWorld : WorldState = cloneWorldState(this.currentState);
        var stack = newWorld.arm;
        if (newWorld.stacks[stack].length == 0) {
            throw "Stack is empty!";
        }
        newWorld.holding = newWorld.stacks[stack].pop();
        return new PlannerTextWorld(newWorld, this.formula);
    }
    public dropClone() : PlannerTextWorld {
      console.log("Entering dropClone");
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var newWorld : WorldState = cloneWorldState(this.currentState);
        var stack = newWorld.arm;
        var holding = newWorld.holding;
        if(newWorld.stacks[stack].length == 0){
          console.log("Cleared 'newWorld.stacks[stack] == []'");
          //EMPTY STACK, WE ABOVE THE FLOOR: DO WE FIND IT?
          if(this.allowedPhysics( holding,"floor", "ontop", newWorld)){
            console.log("Cleared 'allowedPhysics' with target floor");
            newWorld.stacks[stack].push(newWorld.holding);
            newWorld.holding = null;
            console.log("Exiting dropClone with target floor");
            return new PlannerTextWorld(newWorld, this.formula);
          } else {
            throw new Error("what is going on, can't place on floor")
          }
        } else {
          console.log("NOT above empty stack'");
          var topOfStack = newWorld.stacks[stack][newWorld.stacks[stack].length-1];
          if(this.allowedPhysics( holding,topOfStack, "ontop", newWorld)){
            console.log("Allowedphysics passed with target object")
            newWorld.stacks[stack].push(newWorld.holding);
            newWorld.holding = null;
            console.log("Exiting dropClone with target stack");
            return new PlannerTextWorld(newWorld, this.formula);
          } else {
            throw new Error("We cannot drop here")
          }
        }
    }
    public allowedPhysics(s: string, l : string, rel : string, state : WorldState) : boolean{
      //moving the floor (or putting something under it) is not allowed.
      if(s == "floor"){
        return false;
      }

      //Only things on or above floor allowed, but anything is valid in that case.
      // Thus no further checks are needed if this is true.
      if(l == "floor"){
        return (rel == "ontop" || rel == "above");
      }

      //Object can never relate to itself.
      if(s == l){
        return false;
      }


      //Beside, leftof and rightof are always allowed for objects that are not floors. Floors are
      //checked above, thus it is always true at this point.
      if (rel == "beside" || rel == "leftof" || rel == "rightof"){
        return true;
      }

      //Declares variables for specific size- and shape checks.
      var objectSize : string = state.objects[s].size;
      var targetSize : string = state.objects[l].size;
      var objectShape : string = state.objects[s].form;
      var targetShape : string = state.objects[l].form;


      /*
      Checking for the "special" case when something is put under something else. Nothing more
      needs to be checked for "under", so we return after that.
      */
      if(rel == "under"){
        return !(objectShape == "ball" || (objectSize == "small" && targetSize == "large"));
      }

      //In contrast to "under", this is not allowed for any other relation still considered.
      if(objectSize == "large" && targetSize == "small"){
          return false;
      }

      //Balls can't support anything.
      if(targetShape == "ball"){
        return false;
      }

      //Specific checks for "ontop" and "inside".
      if(rel != "above"){
        return this.allowedRelation(s, l, state);
      }
      return true;
    }
    allowedRelation(s : string, l : string, state : WorldState) : boolean {
      var objectSize : string = state.objects[s].size;
      var targetSize : string = state.objects[l].size;
      var objectShape : string = state.objects[s].form;
      var targetShape : string = state.objects[l].form;

      //Boxes cannot contain pyramids, planks or boxes of the same size.
      if(targetShape == "box"){
         if(objectShape == "pyramid" || objectShape == "box" || objectShape == "plank"){
            if(!(targetSize == "large" && objectSize == "small")){
              return false;
            }
         }
      }
      //Balls may only be placed on the floor or in box
      if(objectShape == "ball" && !(targetShape == "floor" || targetShape == "box")){
        return false
      }

      //Small boxes cannot be supported by small bricks or pyramids.
      if(objectShape == "box" && objectSize == "small"){
        if(targetSize == "small" && (targetShape == "pyramid" || targetShape == "brick")){
          return false;
        }
      }
      //Large boxes cannot be supported by large pyramids.
      if(objectSize == "large" && objectShape == "box"){
        return !(targetShape == "pyramid");
      }

      return true;
    }
  }

  function cloneWorldState(state : WorldState) : WorldState {
      var newStacks : Stack[] = [];

      // clone stacks
      for(var i = 0; i < state.stacks.length; i++){
          // For each stack, slice out and add to new list of stacks
          newStacks.push(state.stacks[i].slice(0));
      }

      return {
          stacks: newStacks,
          holding: state.holding,
          arm: state.arm,
          objects: state.objects,
          examples: state.examples
      };
  }
