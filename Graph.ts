///<reference path="lib/collections.ts"/>
///<reference path="lib/node.d.ts"/>
//import * as es6 from "node_modules/es6-collections/es6-collections.js";
//import { Map } from "node_modules/es6-collections"
/** Graph module
*
*  Types for generic A\* implementation.
*
*  *NB.* The only part of this module
*  that you should change is the `aStarSearch` function. Everything
*  else should be used as-is.
*/

/** An edge in a graph. */
class Edge<Node> {
    from : Node;
    to   : Node;
    cost : number;
}

/** A directed graph. */
interface Graph<Node> {
    /** Computes the edges that leave from a node. */
    outgoingEdges(node : Node) : Edge<Node>[];
    /** A function that compares nodes. */
    compareNodes : collections.ICompareFunction<Node>;
}

/** Type that reports the result of a search. */
class SearchResult<Node> {
    /** The path (sequence of Nodes) found by the search algorithm. */
    path : Node[];
    /** The total cost of the path. */
    cost : number;
}

/**
* A\* search implementation, parameterised by a `Node` type. The code
* here is just a template; you should rewrite this function
* entirely. In this template, the code produces a dummy search result
* which just picks the first possible neighbour.
*
* Note that you should not change the API (type) of this function,
* only its body.
* @param graph The graph on which to perform A\* search.
* @param start The initial node.
* @param goal A function that returns true when given a goal node. Used to determine if the algorithm has reached the goal.
* @param heuristics The heuristic function. Used to estimate the cost of reaching the goal from a given Node.
* @param timeout Maximum time (in seconds) to spend performing A\* search.
* @returns A search result, which contains the path from `start` to a node satisfying `goal` and the cost of this path.
*/
function aStarSearch<Node>
    (
    graph : Graph<Node>,
    start : Node,
    goal : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout : number
    )
    : SearchResult<Node> {
    var result : SearchResult<Node> = {
        path: [start],
        cost: 0
    };
    //gScore("apa") = 3
    let closedSet : collections.Set<Node> = new collections.Set<Node>();
    let openSet : collections.Set<Node> = new collections.Set<Node>();
    let cameFrom : collections.Dictionary<Node,Node> = new collections.Dictionary<Node,Node>();
    let gScore : collections.Dictionary<Node,number> = new collections.Dictionary<Node,number>();
    let fScore : collections.Dictionary<Node,number> = new collections.Dictionary<Node,number>();
    openSet.add(start);
    //let cameFrom : Map<Node, Node> = new Map<Node, Node>();
    //let gScore : Map<Node, number> = new Map<Node, number>();
    //let fScore : Map<Node, number> = new Map<Node, number>();
    fScore.setValue(start,heuristics(start));
    gScore.setValue(start,0);

    while(openSet.size() != 0) {
        //Init variables
        //console.log("AT START OF WHILE")
        let lowF : number = Infinity;
        let current : Node = null;
        //Finding "current" by taking node in openSet with lowest fScore.
        //Null otherwise
        for(var n of openSet.toArray()){
            //Needs to check for null
            if(lookup(fScore,n) <= lowF){
              //console.log("if")
              lowF = lookup(gScore,n);
              current = n;
            }
        }
        //goal(current)
        //console.log("CURRENT CHOSEN")
        if (goal(current)){
          console.log("GOAL")
          console.log(cameFrom.toString());
          console.log("GOAL  == CURRENT")
          let result = new SearchResult<Node>();
          result.path = reconstruct_path(cameFrom, current);
          result.cost = 0;
          //result.cost = gScore.getValue(current);
          return(result);
        }
        //console.log("NOT GOAL")
        //remove current from openSet
        //console.log(current.toString())
        openSet.remove(current);
        //console.log("os.r")
        //add to current set
        closedSet.add(current);
        //console.log("cs.a")
        //Find all neighbours to current
        let listOfEdges : Edge<Node>[] = graph.outgoingEdges(current);
        //console.log("loe.l")
        //console.log(listOfEdges.length)
        for(var e of listOfEdges){
          //console.log("FOR ALL neighbour")
          var n = e.to;
          if(closedSet.contains(n)) {
            break
          }
          let tentative_gScore : number = lookup(gScore, current) + e.cost;
          //We find a new node
          if(!openSet.contains(n)){
              //console.log("ADDING TO OPEN")
              openSet.add(n);
              //Completly new nodes get g and f score of inf.
              //fScore.setValue(n, Infinity);
              //gScore.setValue(n, Infinity);
          } else if (tentative_gScore >= lookup(gScore, n)){ //gScore.get might be null, inf in that case
            break
          }
          //We rediscovered a node and the new path is better
          //console.log("found better path")
          cameFrom.setValue(n, current);
          gScore.setValue(n, tentative_gScore);
          fScore.setValue(n, gScore.getValue(n) + heuristics(n));
        }
        //console.log("END OF WHILE")
        //console.log(openSet.size())
    }
    console.log("FAIL TO FIND")
    return null;

}
function lookup<Node>(
  dic : collections.Dictionary<Node,number>,
  target : Node
){
  //console.log("LOOKUP")
  if(dic.containsKey(target)){
    return dic.getValue(target);
  } else {
    //console.log("not in dic")
    return Infinity;
  }
}

function reconstruct_path<Node>
  (
    cameFrom : collections.Dictionary<Node, Node>,
    current : Node
  )
  : Node[] {
  let total_path = [current]
  let total_cost = 0;
  while (cameFrom.getValue(current) != null) {
    current = cameFrom.getValue(current);
    total_path.push(current);
  }
  return total_path;
}


