///<reference path="Graph.ts"/>
///<reference path="World.ts"/>
// This is an example graph
// consisting of a 2-dimensional grid
// where neighbors are vertical and horisontal


class StateNode {
    constructor(
        public state : PlannerTextWorld
    ) {}

    add(action : String) : StateNode {
        /*return new GridNode({
            x: this.pos.x + delta.x,
            y: this.pos.y + delta.y
        });*/
        //should probably return: state.doAction(action)
        return null;
    }

    compareTo(other : StateNode) : number {
        //return (this.pos.x - other.pos.x) || (this.pos.y - other.pos.y);
        return 0;
    }

    toString() : string {
        return this.state.currentState.toString();
    }
}


class StateGraph implements Graph<StateNode> {

    constructor(
      startingState : PlannerTextWorld
      //some form of representing the endstate
    ) {
      //shit to do in constructor goes here
     }

    outgoingEdges(node : StateNode) : Edge<StateNode>[] {
        var outgoing : Edge<StateNode>[] = [];
        //Add all reachable states (with one action) to outgoing
        //Left
        //Right
        //Pick / Drop
        return outgoing;
    }

    compareNodes(a : StateNode, b : StateNode) : number {
        return a.compareTo(b);
    }

    toString(start? : StateNode, goal? : (n:StateNode) => boolean, path? : StateNode[]) : string {
        return "nope";
    }
    heuristic(node : StateNode) : number {
      //Difference from object to subject
      //Return same if ontop, inside, above, below
      //Return distance -1 if beside
      var plannerState : PlannerTextWorld = node.state;
      var currentState : WorldState = plannerState.currentState;
      //This only takes one single disjunction right now
      var literal : Interpreter.Literal = plannerState.formula[0][0];
      var r = literal.relation;
      if(r == "holding"){
        return 0 //TODO: Some holding heuristic for holding some shit
      }
      var object = literal.args[0];
      var subject = literal.args[1]; //For "drop" this might not exist

      var distance : number = this.findDistance(currentState, object, subject);
      if(r == "ontop" || r == "inside" || r == "above" || r == "under"){
        return Math.abs(distance);
      } else if(r == "beside"){
        return Math.abs(distance) - 1;
      } else if (r == "rightof"){
        //object to left of subject
        if(distance < 0) {
          return Math.abs(distance) + 1;
          //object already to right of subject
        } else if (distance > 0){
          return 0;
        }
      } else if (r == "leftof"){
        //object already to left of subject
        if(distance < 0) {
          return 0;
          //object already to right of subject
        } else if (distance > 0){
          return Math.abs(distance) + 1;
        }
      }
      //This should not happen, but if it does...
      return 0;
    }

    //Returns which position the object has in its stack,
    //starting from the top with index 0
    //This is not as usual, but used for heuristics
    findStackPos(state : WorldState, obj : string) : number{
      var stack = state.stacks[this.findStackNbr(state, obj)];
      //längst ner = först
      for(var i = 0; i < stack.length; i ++){
        if(stack[i] == obj){
          return stack.length - 1 - i;
        }
      }
      return 0;

    }

    //returns the number of the stack containing the given object.
    findStackNbr(state : WorldState, obj : string) : number {
      var stacks = state.stacks;
      for(var i = 0; i < stacks.length; i++){
        // If a stack contains the provided entity
        if(stacks[i].indexOf(obj) != -1) {
          return i;
        }
      }
      return -1; //Element not found
    }

    //Returns distance between object and subject. Positive if
    //object is to the right of subjects.
    findDistance(state : WorldState, obj : string, subj : string) : number {
      //Check if we holding dbject or subject
      if(state.holding == obj){
        return state.arm - this.findStackNbr(state, subj);
      } else if (state.holding == subj){
        return this.findStackNbr(state, obj) - state.arm;
      }
      return this.findStackNbr(state, obj) - this.findStackNbr(state, subj);
    }

}
