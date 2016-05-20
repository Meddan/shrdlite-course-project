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
      startingState : WorldState
      //some form of representing the endstate
    ) {
      //shit to do in constructor goes here
     }

    outgoingEdges(node : StateNode) : Edge<StateNode>[] {
        var outgoing : Edge<StateNode>[] = [];
        //Add all reachable states (with one action) to outgoing
        return outgoing;
    }

    compareNodes(a : StateNode, b : StateNode) : number {
        return a.compareTo(b);
    }

    toString(start? : StateNode, goal? : (n:StateNode) => boolean, path? : StateNode[]) : string {
        return "nope";
    }
}
