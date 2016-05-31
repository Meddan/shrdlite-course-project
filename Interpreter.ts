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
    Top-level function for the Interpreter. It calls `interpretCommand` for each possible parse of
    *the command. No need to change this one.
    * @param parses List of parses produced by the Parser.
    * @param currentState The current state of the world.
    * @returns Augments ParseResult with a list of interpretations. Each interpretation is
    *represented by a list of Literals.
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
     * The core interpretation function. The code here is no longer a template!
     * It finds all possible objects referenced in the command, returning the possible
     * interpretations as a DNFFormula. See Readme for more information.
     * @param cmd The actual command. Note that it is *not* a string, but rather an object of type
     *`Command` (as it has been parsed by the parser).
     * @param state The current state of the world. Useful to look up objects in the world.
     * @returns A list of list of Literal, representing a formula in disjunctive normal form (disjunction of conjunctions). See the dummy interpetation returned in the code for an example, which means ontop(a,floor) AND holding(b).
     * @throws An error when no valid interpretations can be found
     */
    function interpretCommand(cmd : Parser.Command, state : WorldState) : DNFFormula {
        // This returns a dummy interpretation involving two random objects in the world
        var cmdverb : string = cmd.command;
        var cmdent : Parser.Entity = cmd.entity;
        var cmdloc : Parser.Location = cmd.location;

        var possibleObj : string[];
        var relationObj : string[];
        var interpretation : DNFFormula = [];

        if(cmdverb == "move"){ // If the command isn't take, we have a relation between two objects
          //Gets all the objects we want to have a relation to
          possibleObj = interpretEntity(cmdent, state);
          if(cmdloc.entity.object.form != "floor"){
            relationObj = interpretEntity(cmdloc.entity, state);
          } else {
            relationObj = ["floor"]
          }
          //Sanity checks
          if(possibleObj.length < 1){
              if(state.holding != null){
                  possibleObj.push(state.holding); //This is not always right...
              } else {
                  throw new Error("No possible object!");
              }
          } else if(relationObj.length < 1) {
            throw new Error("No possible location!")
          }

          // Create commands for all possible relations between the different objects
          for (var s of possibleObj){
            for (var l of relationObj){
              var objRel = cmdloc.relation;
              if(allowedPhysics(s, l, objRel, state)){
                interpretation.push([{polarity: true, relation: objRel, args: [s,l]}]);
              }
            }
          }

          // If there are no interpretations, throw an error
          if(interpretation.length == 0){
            throw new Error("No interpretation!");
          }

          return interpretation;

        } else if(cmdverb == "take"){ // If the command is take, the goal is to hold an object
          possibleObj = interpretEntity(cmdent, state);
          // If there are no matches for the requested object, throw an error
          if(possibleObj.length < 1){
            throw new Error("No possible object!")
          }
          var interpretation : DNFFormula = [];
          for (var s of possibleObj){
            //Can't take floor
            if(s != "floor"){
              interpretation.push([{polarity: true, relation: "holding", args: [s]}]);
            }
          }
          return interpretation;
        } else {
          if(!state.holding){
            throw new Error("I have nothing to put down!")
          }
          if(cmdloc.entity.object.form != "floor"){
            relationObj = interpretEntity(cmdloc.entity, state);
          } else {
            relationObj = ["floor"]
          }
          if(relationObj.length < 1){
            throw new Error("No possible location!");
          }
          var objRel = cmdloc.relation;
          for (var l of relationObj){
            if(allowedPhysics(state.holding, l, objRel, state)){
              interpretation.push([{polarity: true, relation: objRel, args: [state.holding, l]}]);
            }
          }
          if(interpretation.length == 0){
            throw new Error("No interpretation!");
          }
          return interpretation;

        }
    }

    //Checks for allowed relations between objects given the rules of worlds like these.
    function allowedPhysics(s: string, l : string, rel : string, state : WorldState){
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
        return allowedRelation(s, l, state);
      }
      return true;
    }

    /*
    Checks if the objects s and l are allowed to relate, where s is the object to be moved and l
    is the object that it will be placed on or inside. Only these two relations are considered here.
    */
    function allowedRelation(s : string, l : string, state : WorldState) : boolean {
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

    function interpretEntity(ent : Parser.Entity, state : WorldState) : string[] {
        if(ent.quantifier == "the" || ent.quantifier == "any"){
          return interpretObject(ent.object, state);
        } else {
          return null;
        }
    }
    //Finds all objects matching the location given, returning the keys of these objects.
    function interpretLocation( loc : Parser.Location, state : WorldState) : string[]{
      var relationEntities : string[] = interpretEntity(loc.entity, state);

      var wStacks : string[][] = state.stacks;

      // To be returned
      var matchingEntities : string[] = [];

      //Enormous If-statement finding objects depending on their relation.

      if(loc.relation == "above"){
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){

          var currentEntity : string = relationEntities[i];

          // If currentEntity is not floor
          if(currentEntity != "floor"){
            // Get stacks that contain entity
            var eStacks = findStacks(currentEntity, wStacks);

            // Check that it is not top of the stack
            if (eStacks.indexOf(currentEntity) != eStacks.length){
              // If it is not, push it to matching entities

              // Slice from above the entity
              var objIndex : number = eStacks.indexOf(currentEntity) + 1;

              // Slice out objects above entity
              var aboveEntity : string[] = eStacks.slice(objIndex);

              // Push to array
              matchingEntities = matchingEntities.concat(aboveEntity);
            }
          } else { // If currentEntity is floor
            // Add all objects to matching entities as all objects are above the floor
            for(var j = 0; j < wStacks.length; j++){
              matchingEntities = matchingEntities.concat(wStacks[j]);
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

              // Check that it is not top of the stack
              if (eStacks.indexOf(currentEntity) != eStacks.length){

              // Find object directly ontop
              var objIndex = eStacks.indexOf(currentEntity) + 1;

              // Push the object on top to array
              matchingEntities.push(eStacks[objIndex]);

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

            var objectUnderIndex = eStacks.indexOf(currentEntity);
            var obj = eStacks[objectUnderIndex];

            // Check that entity under currentEntity is a box
            if (state.objects[obj].form == "box") {

              // Add the inside object to array
              matchingEntities.push(eStacks[objectUnderIndex+1]);
            }
          }
      } else if (loc.relation == "under") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity, wStacks);

          // Check that currentEntity isn't at bottom
          if (eStacks[j].indexOf(currentEntity) != 0) {

            // Slice out objects above entity
            var underEntity : string[] = eStacks.slice(0, eStacks.indexOf(currentEntity));

            // Push to array
            matchingEntities = matchingEntities.concat(underEntity);
          }

        }

      } else if (loc.relation == "beside") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity,wStacks);

          // Find index of stack in the world
          var indexOfStack = wStacks.indexOf(eStacks);
          var toLeft = indexOfStack - 1;
          var toRight = indexOfStack + 1;

          // If stack to left is not out of bounds
          if(toLeft >= 0){
            // Add to array
            matchingEntities = matchingEntities.concat(wStacks[toLeft]);
          }

          // If stack to right is not out of bounds
          if(toRight <= wStacks.length){
            // Add to array
            matchingEntities = matchingEntities.concat(wStacks[toRight]);
          }
        }
      } else if (loc.relation == "leftof") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity, wStacks);

          // Find where the stack is in the world
          var indexOfStack = wStacks.indexOf(eStacks);

          // For all stacks to the left (or before) the current stack
          for(var k = 0; k < indexOfStack; k++){
            // Add that stack to array
            matchingEntities = matchingEntities.concat(wStacks[k]);
          }

        }

      } else if (loc.relation == "rightof") {
        // Go through all entities we have found
        for(var i = 0; i < relationEntities.length; i++){
          var currentEntity : string = relationEntities[i];

          // Get stacks that contain entity
          var eStacks = findStacks(currentEntity, wStacks);

          // Find where the stack is in the world
          var indexOfStack = wStacks.indexOf(eStacks);

          // For all stacks to the right (or after) the current stack
          for(var k = indexOfStack+1; k < wStacks.length; k++){
            // Add that stack to array
            matchingEntities = matchingEntities.concat(wStacks[k]);
          }

        }
      } else {
        return null;
      }
      return matchingEntities;
    }

    // Find and return all stacks that contain provided entity
    function findStacks (ent : string, stacks : string[][]) : string[]{
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
      throw new Error("No mathcing stack");

    }
    //Find all objects in the world matching a objectdefinition.
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

      if(state.holding){
          objdefs.push(state.objects[state.holding]);
          keys.push(state.holding);
      }

      if (objobj == null){
        if(objform == "floor"){
          return ["floor"];
        }
        //We have obj = {size?,color?,form}
        var tempdefs : ObjectDefinition[] = new Array<ObjectDefinition>();
        //take all of the same form
        for(var o of objdefs){
          if (o.form == objform || objform == "anyform"){
            tempdefs.push(o);
          }
        }

        //remove all objects that do not have the correct color
        if(objcolor != null){
          for (var x = 0; x < tempdefs.length; x++){
            var xObj = tempdefs[x];
            if(xObj.color != objcolor){
              removeFromArray(tempdefs,xObj);
              x--;
            }
          }
        }
        //remove all objects of the wrong size
        if(objsize != null){
          for (var u = 0; u < tempdefs.length; u++){
            var uObj = tempdefs[u];
            if(uObj.size != objsize){
              removeFromArray(tempdefs,uObj);
              u--;
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
        /*
        Intersection between objects that match the description and objects that are
        at the correct location
        */
        var ansList = subjectStrings.filter(function(n) {
          return objectStrings.indexOf(n) != -1;
        });

        return ansList;
      }
    }
    function removeFromArray<T>(arr : T[], toBeRemoved : T) {
      var index = arr.indexOf(toBeRemoved);
      arr.splice(index,1);
    }
}
