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
      var r = plannerState.relation;
      var distance : number = this.findDistance(currentState, plannerState.object, plannerState.subject);
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

    findDistance(state : WorldState, obj : string, subj : string) : number {
      var stacks = state.stacks;
      var objStack : number;
      var subjStack : number;
      for(var i = 0; i < stacks.length; i++){
        // If a stack contains the provided entity
        if(stacks[i].indexOf(obj) != -1) {
          objStack = stacks[i].indexOf(obj);
          break;
        }
      }
      for(var i = 0; i < stacks.length; i++){
        // If a stack contains the provided entity
        if(stacks[i].indexOf(subj) != -1) {
          subjStack = stacks[i].indexOf(subj);
          break;
        }
      }
      return objStack - subjStack;
    }
}
