///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="PlannerTextWorld.ts"/>
///<reference path="./StateGraph.ts"/>
/**
* Planner module
*
* The goal of the Planner module is to take the interpetation(s)
* produced by the Interpreter module and to plan a sequence of actions
* for the robot to put the world into a state compatible with the
* user's command, i.e. to achieve what the user wanted.
*
* The planner should use your A* search implementation to find a plan.
*/
module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    /**
     * Top-level driver for the Planner. Calls `planInterpretation` for each given interpretation generated by the Interpreter.
     * @param interpretations List of possible interpretations.
     * @param currentState The current state of the world.
     * @returns Augments Interpreter.InterpretationResult with a plan represented by a list of strings.
     */
    export function plan(interpretations : Interpreter.InterpretationResult[], currentState : WorldState) : PlannerResult[] {
        var errors : Error[] = [];
        var plans : PlannerResult[] = [];
        interpretations.forEach((interpretation) => {
            try {
                var result : PlannerResult = <PlannerResult>interpretation;
                result.plan = planInterpretation(result.interpretation, currentState);
                if (result.plan.length == 0) {
                    result.plan.push("That is already true!");
                }
                plans.push(result);
            } catch(err) {
                errors.push(err);
            }
        });
        if (plans.length) {
            return plans;
        } else {
            // only throw the first error found
            throw errors[0];
        }
    }

    export interface PlannerResult extends Interpreter.InterpretationResult {
        plan : string[];
    }

    export function stringify(result : PlannerResult) : string {
        return result.plan.join(", ");
    }

    //////////////////////////////////////////////////////////////////////
    // private functions

    /**
     * The core planner function. The code here is just a template;
     * you should rewrite this function entirely. In this template,
     * the code produces a dummy plan which is not connected to the
     * argument `interpretation`, but your version of the function
     * should be such that the resulting plan depends on
     * `interpretation`.
     *
     *
     * @param interpretation The logical interpretation of the user's desired goal. The plan needs to be such that by executing it, the world is put into a state that satisfies this goal.
     * @param state The current world state.
     * @returns Basically, a plan is a
     * stack of strings, which are either system utterances that
     * explain what the robot is doing (e.g. "Moving left") or actual
     * actions for the robot to perform, encoded as "l", "r", "p", or
     * "d". The code shows how to build a plan. Each step of the plan can
     * be added using the `push` method.
     */
    function planInterpretation(interpretation : Interpreter.DNFFormula, state : WorldState) : string[] {
        // This function returns a dummy plan involving a random stack

        if(interpretation[0].length > 1 || interpretation.length > 1){
          //Handle ambiguity.
          throw new Error("ambiguous interpretation")
        }

        var plan : string[] = [];
        var ptw : PlannerTextWorld = new PlannerTextWorld(state, interpretation);
        var sg : StateGraph = new StateGraph(ptw);
        var result : SearchResult<StateNode> = aStarSearch(sg, new StateNode(ptw), sg.isGoalNode, sg.heuristic, 10000000000 );
        console.log(result);

        console.log("WE GUN BULD IT ");
        console.log(result.path.length);
        for (var j = 0; j < result.path.length-1; j++) {
            console.log("BUILDINGN PLAN");
            console.log(result.path[j]);
            var outedges : PlannerEdge<StateNode>[] = sg.outgoingEdges(result.path[j]);
            for (var k = 0; k < outedges.length; k++) {
                var nextNode = outedges[k].to;
                console.log("NEXTNODE");
                console.log(nextNode.state.printWorld());
                console.log("PATHNODE");
                console.log(result.path[j+1].state.printWorld());
                if (nextNode.compareTo(result.path[j+1])) {
                    console.log("compare works");
                    plan.push(outedges[k].action);
                }
            }
        }
        console.log(plan);
        return plan;
    }
}
