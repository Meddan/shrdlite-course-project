var Interpreter;
(function (Interpreter) {
    function interpret(parses, currentState) {
        var errors = [];
        var interpretations = [];
        parses.forEach(function (parseresult) {
            try {
                var result = parseresult;
                result.interpretation = interpretCommand(result.parse, currentState);
                interpretations.push(result);
            }
            catch (err) {
                errors.push(err);
            }
        });
        if (interpretations.length) {
            return interpretations;
        }
        else {
            throw errors[0];
        }
    }
    Interpreter.interpret = interpret;
    function stringify(result) {
        return result.interpretation.map(function (literals) {
            return literals.map(function (lit) { return stringifyLiteral(lit); }).join(" & ");
        }).join(" | ");
    }
    Interpreter.stringify = stringify;
    function stringifyLiteral(lit) {
        return (lit.polarity ? "" : "-") + lit.relation + "(" + lit.args.join(",") + ")";
    }
    Interpreter.stringifyLiteral = stringifyLiteral;
    function interpretCommand(cmd, state) {
        var cmdverb = cmd.command;
        var cmdent = cmd.entity;
        var cmdloc = cmd.location;
        var possibleObj;
        var possibleLoc;
        possibleObj = interpretEntity(cmdent, state);
        if (cmdverb != "take") {
            possibleLoc = interpretLocation(cmdloc, state);
            if (possibleObj.length < 1) {
                throw new Error("No possible object!");
            }
            else if (possibleLoc.length < 1) {
                throw new Error("No possible location!");
            }
            var interpretation = [[]];
            for (var _i = 0, possibleObj_1 = possibleObj; _i < possibleObj_1.length; _i++) {
                var s = possibleObj_1[_i];
                for (var _a = 0, possibleLoc_1 = possibleLoc; _a < possibleLoc_1.length; _a++) {
                    var l = possibleLoc_1[_a];
                    interpretation.push([{ polarity: true, relation: cmdloc.relation, args: [s, l] }]);
                }
            }
        }
        else {
            if (possibleObj.length < 1) {
                throw new Error("No possible object!");
            }
            var interpretation = [[]];
            for (var _b = 0, possibleObj_2 = possibleObj; _b < possibleObj_2.length; _b++) {
                var s = possibleObj_2[_b];
                interpretation.push([{ polarity: true, relation: "holding", args: [s] }]);
            }
            return interpretation;
        }
    }
    function interpretEntity(ent, state) {
        if (ent.quantifier == "the" || ent.quantifier == "any") {
            return interpretObject(ent.object, state);
        }
        else {
            console.log("Unknown quantifier: " + ent.quantifier);
            return null;
        }
    }
    function interpretLocation(loc, state) {
        var relationEntities = interpretEntity(loc.entity, state);
        var wStacks = state.stacks;
        var matchingEntities = [];
        if (loc.relation == "above") {
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                var eStacks = findStacks(currentEntity, wStacks);
                for (var j = 0; j < eStacks.length; j++) {
                    if (eStacks[j].indexOf(currentEntity) != eStacks[j].length) {
                        var sliceFrom = eStacks[j].indexOf(currentEntity) + 1;
                        var aboveEntity = eStacks[j].slice(sliceFrom);
                        matchingEntities.concat(aboveEntity);
                    }
                }
            }
        }
        else if (loc.relation == "ontop") {
<<<<<<< ff508219f06c92f830a0f0799ab90d76d0619799
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                var eStacks = findStacks(currentEntity, wStacks);
                for (var j = 0; j < eStacks.length; j++) {
                    if (eStacks[j].indexOf(currentEntity) != eStacks[j].length) {
                        var sliceFrom = eStacks[j].indexOf(currentEntity) + 1;
                        matchingEntities.concat(eStacks[j].slice(sliceFrom, sliceFrom + 1));
                    }
                }
            }
=======
>>>>>>> Interpret command.
        }
        else if (loc.relation == "inside") {
        }
        else if (loc.relation == "under") {
        }
        else if (loc.relation == "beside") {
        }
        else if (loc.relation == "leftof") {
        }
        else if (loc.relation == "rightof") {
        }
        else {
            console.log("Unknown relation");
            return null;
        }
        return matchingEntities;
    }
    function findStacks(ent, stacks) {
        var returnArray = [];
        for (var i = 0; i < stacks.length; i++) {
            if (stacks[i].indexOf(ent) != -1) {
                returnArray.push(stacks[i]);
            }
        }
        return returnArray;
    }
    function interpretObject(obj, state) {
        var objcolor = obj.color;
        var objsize = obj.size;
        var objform = obj.form;
        var objobj = obj.object;
        var objloc = obj.location;
        var keys = Array.prototype.concat.apply([], state.stacks);
        var objdefs = new Array();
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var s = keys_1[_i];
            objdefs.push(state.objects[s]);
        }
        if (objobj == null) {
            var tempdefs = new Array();
            for (var _a = 0, objdefs_1 = objdefs; _a < objdefs_1.length; _a++) {
                var o = objdefs_1[_a];
                if (o.form == objform) {
                    tempdefs.push(o);
                }
            }
            if (objcolor != null) {
                for (var _b = 0, tempdefs_1 = tempdefs; _b < tempdefs_1.length; _b++) {
                    var u = tempdefs_1[_b];
                    if (u.color != objcolor) {
                        removeFromArray(tempdefs, u);
                    }
                }
            }
            if (objsize != null) {
                for (var _c = 0, tempdefs_2 = tempdefs; _c < tempdefs_2.length; _c++) {
                    var u = tempdefs_2[_c];
                    if (u.size != objsize) {
                        removeFromArray(tempdefs, u);
                    }
                }
            }
            var ans = new Array();
            for (var _d = 0, tempdefs_3 = tempdefs; _d < tempdefs_3.length; _d++) {
                var d = tempdefs_3[_d];
                ans.push(keys[objdefs.indexOf(d)]);
            }
            return ans;
        }
        else {
            var subjectStrings = interpretObject(objobj, state);
            var objectStrings = interpretLocation(objloc, state);
            subjectStrings.filter(function (n) {
                return objectStrings.indexOf(n) != -1;
            });
            return subjectStrings;
        }
    }
    function removeFromArray(arr, toBeRemoved) {
        var index = arr.indexOf(toBeRemoved);
        arr.splice(index, 1);
    }
})(Interpreter || (Interpreter = {}));
