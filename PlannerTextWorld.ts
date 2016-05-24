/// <reference path="./TextWorld.ts"/>
class PlannerTextWorld extends TextWorld {

    constructor(public currentState : WorldState, public formula : Interpreter.DNFFormula) {
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
        return new PlannerTextWorld(newWorld, this.formula);
    }

    public dropClone() : PlannerTextWorld {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        var newWorld : WorldState = this.currentState;
        var stack = newWorld.arm;
        var holding = newWorld.holding;
        if(newWorld.stacks[stack] == []){
          //EMPTY STACK WE HAVE FLOOR
          if(this.allowedPhysics( holding,"floor", "ontop", newWorld)){
            newWorld.stacks[stack].push(newWorld.holding);
            newWorld.holding = null;
            return new PlannerTextWorld(newWorld, this.formula);
          } else {
            throw new Error("what is going on, can't place on floor")
          }
        } else {
          var topOfStack = newWorld.stacks[stack][-1];
          if(this.allowedPhysics( holding,topOfStack, "ontop", newWorld)){
            newWorld.stacks[stack].push(newWorld.holding);
            newWorld.holding = null;
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
