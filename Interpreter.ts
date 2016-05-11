///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

/**
* Interpreter module
*
* The goal of the Interpreter module is to interpret a sentence
* written by the user in the context of the current world state. In
* particular, it must figure out which objects in the world,
* i.e. which elements in the `objects` field of WorldState, correspond
* to the ones referred to in the sentence.
*
* Moreover, it has to derive what the intended goal state is and
* return it as a logical formula described in terms of literals, where
* each literal represents a relation among objects that should
* hold. For example, assuming a world state where "a" is a ball and
* "b" is a table, the command "put the ball on the table" can be
* interpreted as the literal ontop(a,b). More complex goals can be
* written using conjunctions and disjunctions of these literals.
*
* In general, the module can take a list of possible parses and return
* a list of possible interpretations, but the code to handle this has
* already been written for you. The only part you need to implement is
* the core interpretation function, namely `interpretCommand`, which produces a
* single interpretation for a single command.
*/
module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

/**
Top-level function for the Interpreter. It calls `interpretCommand` for each possible parse of the command. No need to change this one.
* @param parses List of parses produced by the Parser.
* @param currentState The current state of the world.
* @returns Augments ParseResult with a list of interpretations. Each interpretation is represented by a list of Literals.
*/
    export function interpret(parses : Parser.ParseResult[], currentState : WorldState) : InterpretationResult[] {
        var errors : Error[] = [];
        var interpretations : InterpretationResult[] = [];
        parses.forEach((parseresult) => {
            try {
                var result : InterpretationResult = <InterpretationResult>parseresult;
                result.interpretation = interpretCommand(result.parse, currentState);
                interpretations.push(result);
            } catch(err) {
                errors.push(err);
            }
        });
        if (interpretations.length) {
            return interpretations;
        } else {
            // only throw the first error found
            throw errors[0];
        }
    }

    export interface InterpretationResult extends Parser.ParseResult {
        interpretation : DNFFormula;
    }

    export type DNFFormula = Conjunction[];
    type Conjunction = Literal[];

    /**
    * A Literal represents a relation that is intended to
    * hold among some objects.
    */
    export interface Literal {
	/** Whether this literal asserts the relation should hold
	 * (true polarity) or not (false polarity). For example, we
	 * can specify that "a" should *not* be on top of "b" by the
	 * literal {polarity: false, relation: "ontop", args:
	 * ["a","b"]}.
	 */
        polarity : boolean;
	/** The name of the relation in question. */
        relation : string;
	/** The arguments to the relation. Usually these will be either objects
     * or special strings such as "floor" or "floor-N" (where N is a column) */
        args : string[];
    }

    export function stringify(result : InterpretationResult) : string {
        return result.interpretation.map((literals) => {
            return literals.map((lit) => stringifyLiteral(lit)).join(" & ");
            // return literals.map(stringifyLiteral).join(" & ");
        }).join(" | ");
    }

    export function stringifyLiteral(lit : Literal) : string {
        return (lit.polarity ? "" : "-") + lit.relation + "(" + lit.args.join(",") + ")";
    }

    //////////////////////////////////////////////////////////////////////
    // private functions
    /**
     * The core interpretation function. The code here is just a
     * template; you should rewrite this function entirely. In this
     * template, the code produces a dummy interpretation which is not
     * connected to `cmd`, but your version of the function should
     * analyse cmd in order to figure out what interpretation to
     * return.
     * @param cmd The actual command. Note that it is *not* a string, but rather an object of type `Command`
     * (as it has been parsed by the parser).
     * @param state The current state of the world. Useful to look up objects in the world.
     * @returns A list of list of Literal, representing a formula in disjunctive normal form
     * (disjunction of conjunctions). See the dummy interpetation returned in the code for an example,
     * which means ontop(a,floor) AND holding(b).
     */
    function interpretCommand(cmd : Parser.Command, state : WorldState) : DNFFormula {
        // This returns a dummy interpretation involving two random objects in the world
        console.log("New command!")
        var cmdverb : string = cmd.command;
        var cmdent : Parser.Entity = cmd.entity;
        var cmdloc : Parser.Location = cmd.location;

        var possibleObj : string[];
        var relationObj : string[];

        possibleObj = interpretEntity(cmdent, state);

        if(cmdverb != "take"){
          console.log("NOT TAKE");
          console.log("location:");
          console.log(cmdloc.relation);
          //Gets all the objects we want to have a relation to.
          relationObj = interpretLocation(cmdloc, state);
          //Sanity checks
          if(possibleObj.length < 1){
            console.log("NO POSSIBLE OBJECT")
            throw new Error("No possible object!")
          } else if(relationObj.length < 1) {
            console.log("NO POSSIBLE LOCATION")
            throw new Error("No possible location!")
          }
          console.log("PASSED SANITY")

          var interpretation : DNFFormula = [[]];
          for (var s of possibleObj){
            for (var l of relationObj){
              //FIND OUT WHAT POSITIONS ARE OK DEPENDING ON s and l and add them to interpretation.
              interpretation.push([{polarity: true, relation: cmdloc.relation, args: [s,l]}]);
            }
          }
          console.log(interpretation.toString);
          return interpretation;
          /*return [[
            {polarity: true, relation: "above", args: ["f","g"]}],[
            {polarity: true, relation: "above", args: ["e","g"]}
          ]];*/

        } else {
          if(possibleObj.length < 1){
            throw new Error("No possible object!")
          }
          var interpretation : DNFFormula = [[]];
          for (var s of possibleObj){
            interpretation.push([{polarity: true, relation: "holding", args: [s]}]);
          }
          return interpretation;
        }
    }
    //This is probably what interpretCommand should do...
    // I WORK FROM HERE....
    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[] {
        if(ent.quantifier == "the" || ent.quantifier == "any"){
          return interpretObject(ent.object, state);
        } else {
          console.log("Unknown quantifier: " + ent.quantifier)
          return null;
        }
    }
    // ...TO HERE
    function interpretLocation( loc : Parser.Location, state : WorldState) : string[]{
      console.log("intloc")
      var relationEntities : string[] = interpretEntity(loc.entity, state);

      var wStacks : string[][] = state.stacks;

      // To be returned
      var matchingEntities : string[] = [];
      console.log(loc.relation)
      if(loc.relation == "above"){
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity, wStacks);

          // Go through all stacks entity is in
          for(var j = 0; j < eStacks.length; j++){
            // Check that it is not top of the stack
            if (eStacks[j].indexOf(currentEntity) != eStacks[j].length){
              // If it is not, push it to matching entities

              // Slice from above the entity
              var objIndex : number = eStacks[j].indexOf(currentEntity) + 1;

              // Slice out objects above entity
              var aboveEntity : string[] = eStacks[j].slice(objIndex);

              // Push to array
              matchingEntities.concat(aboveEntity);
            }
          }

        }
      } else if (loc.relation == "ontop") {
          // Go through all entities we have found
          for(var i = 0; i < relationEntities.length; i++){
            var currentEntity : string = relationEntities[i];

            // If we dont want something on top of the floor
            if(currentEntity != "floor"){
              // Get stacks that contain entity
              var eStacks = findStacks(currentEntity, wStacks);

              // Go through all stacks entity is in
              for(var j = 0; j < eStacks.length; j++){
                // Check that it is not top of the stack
                if (eStacks[j].indexOf(currentEntity) != eStacks[j].length){

                // Find object directly ontop
                var objIndex = eStacks[j].indexOf(currentEntity) + 1;

                // Push the object on top to array
                matchingEntities.push(eStacks[j][objIndex]);
                }
              }
            } else { // If we do want something on top of the floor
              // For all stacks
              for(var j = 0; j < wStacks.length; j++){
                // If it is non empty
                if(wStacks[j].length != 0){
                  // Take the first entity in it, as it is on top of the floor
                  matchingEntities.push(wStacks[j][0]);
                }
              }
            }
          }
      } else if (loc.relation == "inside") {
          // Go through all entities we have found
          for(var i = 0; i < relationEntities.length; i++){
            var currentEntity : string = relationEntities[i];

            // Get stacks that contain entity
            var eStacks = findStacks(currentEntity, wStacks);

            // Go through all stacks entity is in
            for(var j = 0; j < eStacks.length; j++){

              // Check that currentEntity isn't at bottom
              if (eStacks[j].indexOf(currentEntity) != 0) {

                var objectUnderIndex = eStacks[j].indexOf(currentEntity) - 1;
                var obj = eStacks[j][objectUnderIndex];

                // Check that box is under currentEntity
                if (state.objects[obj].form == "box") {

                  // Add the inside object to array
                  matchingEntities.push(eStacks[j][objectUnderIndex+1]);
                }
              }
            }
          }
      } else if (loc.relation == "under") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity, wStacks);

          // Go through all stacks entity is in
          for(var j = 0; j < eStacks.length; j++){
            // Check that currentEntity isn't at bottom
            if (eStacks[j].indexOf(currentEntity) != 0) {
              // Slice from above the entity

              // Slice out objects above entity
              var underEntity : string[] = eStacks[j].slice(0, eStacks[j].indexOf(currentEntity));

              // Push to array
              matchingEntities.concat(underEntity);
            }
          }
        }

      } else if (loc.relation == "beside") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity,wStacks);

          for(var j = 0; j < eStacks.length; j++){
            // Find index of stack in the world
            var indexOfStack = wStacks.indexOf(eStacks[j]);
            var toLeft = indexOfStack - 1;
            var toRight = indexOfStack + 1;

            // If stack to left is not out of bounds
            if(toLeft >= 0){
              // Add to array
              matchingEntities.concat(wStacks[toLeft]);
            }

            // If stack to right is not out of bounds
            if(toRight <= wStacks.length){
              // Add to array
              matchingEntities.concat(wStacks[toRight]);
            }
          }
        }


      } else if (loc.relation == "leftof") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity, wStacks);

          //Go through all stacks entity is in
          for(var j = 0; j < eStacks.length; j++){
            // Find where the stack is in the world
            var indexOfStack = wStacks.indexOf(eStacks[j]);

            // For all stacks to the left (or before) the current stack
            for(var k = 0; k < indexOfStack; k++){
              // Add that stack to array
              matchingEntities.concat(wStacks[k]);
            }
          }
        }

      } else if (loc.relation == "rightof") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity, wStacks);

          //Go through all stacks entity is in
          for(var j = 0; j < eStacks.length; j++){
            // Find where the stack is in the world
            var indexOfStack = wStacks.indexOf(eStacks[j]);

            // For all stacks to the right (or after) the current stack
            for(var k = indexOfStack+1; k < wStacks.length; k++){
              // Add that stack to array
              matchingEntities.concat(wStacks[k]);
            }
          }
        }
      } else {
        console.log("Unknown relation");
        return null;
      }
      console.log("RETURNING")
      return matchingEntities;
    }

    // Find and return all stacks that contain provided entity
    function findStacks (ent : string, stacks : string[][]) : string[][]{
      var returnArray : string[][] = [];

      // Go through all stacks
      for(var i = 0; i < stacks.length; i++){
        // If a stack contains the provided entity
        if(stacks[i].indexOf(ent) != -1) {
          // Add the stack to the array of matching stacks
          returnArray.push(stacks[i]);
        }
      }
      return returnArray;
    }

    function interpretObject( obj : Parser.Object, state : WorldState) : string[]{
      var objcolor = obj.color;
      var objsize  = obj.size;
      var objform  = obj.form;
      var objobj = obj.object;
      var objloc = obj.location;
      var keys : string[] = Array.prototype.concat.apply([], state.stacks);
      var objdefs : ObjectDefinition[] = new Array<ObjectDefinition>();
      for(var s of keys){
        objdefs.push(state.objects[s]);
      }

      if (objobj == null){
        if(objform == "floor"){
          console.log("FLOOR")
          return ["floor"];
        }
        //We have obj = {size?,color?,form}
        var tempdefs : ObjectDefinition[] = new Array<ObjectDefinition>();
        //take all of the same form
        for(var o of objdefs){
          if (o.form == objform){
            tempdefs.push(o);
          }
        }
        //remove all objects that do not have the correct color
        if(objcolor != null){
          for (var u of tempdefs){
            if(u.color != objcolor){
              removeFromArray(tempdefs,u);
            }
          }
        }
        //remove all objects of the wrong size
        if(objsize != null){
          for (var u of tempdefs){
            if(u.size != objsize){
              removeFromArray(tempdefs,u);
            }
          }
        }
        //return list of all matching objects.
        var ans : string[] = new Array<string>();
        for(var d of tempdefs){
          ans.push(keys[objdefs.indexOf(d)])
        }
        return ans;
      } else {
        //obj = {Object Location}
        //Objects that match the first (subject)
        var subjectStrings : string[]= interpretObject(objobj, state);
        //Objects that match the second (object)
        var objectStrings : string[]= interpretLocation(objloc, state);
        //Intersection between objects that match the description
        //and objects that are at the correct location
        subjectStrings.filter(function(n) {
          return objectStrings.indexOf(n) != -1;
        });
        return subjectStrings;
      }
    }
    function removeFromArray<T>(arr : T[], toBeRemoved : T) {
      var index = arr.indexOf(toBeRemoved);
      arr.splice(index,1);
    }

}
