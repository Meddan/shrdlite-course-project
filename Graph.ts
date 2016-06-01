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
    let startTime = new Date().getTime();
    let openSet : collections.Set<Node> = new collections.Set<Node>();
    let cameFrom : collections.Dictionary<Node,Node> = new collections.Dictionary<Node,Node>(nodeToString);
    let gScore : collections.Dictionary<Node,number> = new collections.Dictionary<Node,number>(nodeToString);
    let fScore : collections.Dictionary<Node,number> = new collections.Dictionary<Node,number>(nodeToString);
    openSet.add(start);
    fScore.setValue(start,heuristics(start));
    gScore.setValue(start,0);

    while(openSet.size() != 0) {
        //Init variables
        let lowF : number = Infinity;
        let current : Node = null;
        //Finding "current" by taking node in openSet with lowest fScore.
        //Null otherwise (which should never happen)
        for(var n of openSet.toArray()){
            //Needs to check for null
            if(lookup(fScore,n) <= lowF){
              lowF = lookup(gScore,n);
              current = n;
            }
        }
        if (goal(current)){
          let result = new SearchResult<Node>();
          result.path = reconstruct_path(cameFrom, current).reverse();
          result.cost = gScore.getValue(current);
          return(result);
        }
        openSet.remove(current);
        //Find all neighbours to current
        let listOfEdges : Edge<Node>[] = graph.outgoingEdges(current);
        for(var e of listOfEdges){
          var n = e.to;
          //Calculate the cost of the path to the neighbour
          let tentative_gScore : number = lookup(gScore, current) + e.cost;
          //We find a new node or a better path to a node previously discovered.
          if(tentative_gScore < lookup(gScore, n)){
            //Add it to the nodes to be explored and set values.
            openSet.add(n)
            cameFrom.setValue(n,current);
            gScore.setValue(n,tentative_gScore)
            fScore.setValue(n, lookup(gScore, n) + heuristics(n))
          }
        }
        let endTime = new Date().getTime();
        if(endTime - startTime >= 1000*timeout){
          throw new Error("No path found before timeout");
        }
    }
    return null;

}
function lookup<Node>(
  dic : collections.Dictionary<Node,number>,
  target : Node
){
  if(dic.containsKey(target)){
    return dic.getValue(target);
  } else {
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

function nodeToString<Node> (key : Node) : string{
    return key.toString();
}
