///<reference path="Graph.ts"/>
///<reference path="World.ts"/>
// This is an example graph
// consisting of a 2-dimensional grid
// where neighbors are vertical and horisontal
class PlannerEdge<Node> extends Edge<Node>{
  action : string
}
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
        var thisState = this.state.currentState;
        var otherState = other.state.currentState;
        if(thisState.holding == otherState.holding) {
            if(thisState.arm == otherState.arm) {
                if(thisState.stacks.length == otherState.stacks.length) {
                    for(var i = 0; i < thisState.stacks.length; i++) {
                        if(thisState.stacks[i].length == otherState.stacks.length) {
                            for(var j = 0; j < thisState.stacks[i].length; j++) {
                                if(thisState.stacks[i][j] != otherState.stacks[i][j]) {
                                    return 0;
                                }
                            }
                        }
                    }
                }
            }
        }
        return 1;
    }
    // Create string of all stacks, concat holding and arm position
    toString() : string {
        var toReturn : string = "";

        for(var i = 0; i < this.state.currentState.stacks.length; i++){
            var curStack = this.state.currentState.stacks[i];
            if(curStack == []){
                toReturn = toReturn.concat("");
            } else {
                toReturn = toReturn.concat(curStack.join());
            }
        }

        toReturn = toReturn.concat(this.state.currentState.holding + this.state.currentState.arm);

        return toReturn;
    }
}


class StateGraph implements Graph<StateNode> {

    constructor(
      startingState : PlannerTextWorld
      //some form of representing the endstate
    ) {
      //shit to do in constructor goes here
     }
     isGoalNode(n : StateNode) : boolean {
       return n.state.isGoal()
     }
    outgoingEdges(node : StateNode) : PlannerEdge<StateNode>[] {
        var outgoing : PlannerEdge<StateNode>[] = [];
        //Add all reachable states (with one action) to outgoing
        //Left
        var newNode : StateNode;
        try {
          newNode = new StateNode(node.state.leftClone())
          outgoing.push({
              from: node,
              to: newNode,
              cost: 1,
              action: "l"
          });
        } catch(Error){}
        //Right
        try {
          newNode = new StateNode(node.state.rightClone())
          outgoing.push({
              from: node,
              to: newNode,
              cost: 1,
              action: "r"
          });
        } catch(Error){}
        //Pick
        try {
          newNode = new StateNode(node.state.pickClone())
          outgoing.push({
              from: node,
              to: newNode,
              cost: 1,
              action: "p"
          });
        } catch(Error){}
        //Drop
        try {
          newNode = new StateNode(node.state.dropClone())
          outgoing.push({
              from: node,
              to: newNode,
              cost: 1,
              action: "d"
          });
        } catch(Error){}
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

      //This only takes one single disjunction right now, maybe not right...
      var literal : Interpreter.Literal = plannerState.formula[0][0];
      var r = literal.relation;

      if(r == "holding"){
        var toHold = literal.args[0];
        return Math.abs (findStackNbr(currentState, toHold)
         - currentState.arm) + findStackHeuristic(currentState, toHold);
      }

      var object = literal.args[0];
      var subject = literal.args[1]; //For

      var distance : number = findDistance(currentState, object, subject);
      if(r == "ontop" || r == "inside"){
        //We need to reach both object and subject to be on top of stack.
        return Math.abs(distance) +
          findStackHeuristic(currentState, object) +
          findStackHeuristic(currentState, subject);
      } else if(r == "above"){
          return Math.abs(distance) +
            findStackHeuristic(currentState, object);
      } else if (r == "below"){
        return Math.abs(distance) +
          findStackHeuristic(currentState, subject);
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

}
//Returns which position the object has in its stack,
//starting from the top with index 0
//This is not as usual, but used for heuristics
function findStackHeuristic(state : WorldState, obj : string) : number{
  if(state.holding == obj){
    return 0; //Is 0 if we hold that shit already
  }

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
function findStackNbr(state : WorldState, obj : string) : number {
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
function findDistance(state : WorldState, obj : string, subj : string) : number {
  //Check if we holding dbject or subject
  if(state.holding == obj){
    return state.arm - this.findStackNbr(state, subj);
  } else if (state.holding == subj){
    return this.findStackNbr(state, obj) - state.arm;
  }
  return this.findStackNbr(state, obj) - this.findStackNbr(state, subj);
}
