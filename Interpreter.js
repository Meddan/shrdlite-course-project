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
        var relationObj;
        possibleObj = interpretEntity(cmdent, state);
        if (cmdverb != "take") {
            if (cmdloc.entity.object.form != "floor") {
                relationObj = interpretEntity(cmdloc.entity, state);
            }
            else {
                relationObj = ["floor"];
            }
            if (possibleObj.length < 1) {
                throw new Error("No possible object!");
            }
            else if (relationObj.length < 1) {
                throw new Error("No possible location!");
            }
            var interpretation = [];
            for (var _i = 0, possibleObj_1 = possibleObj; _i < possibleObj_1.length; _i++) {
                var s = possibleObj_1[_i];
                for (var _a = 0, relationObj_1 = relationObj; _a < relationObj_1.length; _a++) {
                    var l = relationObj_1[_a];
                    var objRel = cmdloc.relation;
                    if (allowedPhysics(s, l, objRel, state)) {
                        interpretation.push([{ polarity: true, relation: objRel, args: [s, l] }]);
                    }
                }
            }
            if (interpretation.length == 0) {
                throw new Error("No interpretation!");
            }
            return interpretation;
        }
        else {
            if (possibleObj.length < 1) {
                throw new Error("No possible object!");
            }
            var interpretation = [];
            for (var _b = 0, possibleObj_2 = possibleObj; _b < possibleObj_2.length; _b++) {
                var s = possibleObj_2[_b];
                if (s != "floor") {
                    interpretation.push([{ polarity: true, relation: "holding", args: [s] }]);
                }
            }
            return interpretation;
        }
    }
    function allowedPhysics(s, l, rel, state) {
        if (s == "floor") {
            return false;
        }
        if (l == "floor") {
            return (rel == "ontop" || rel == "above");
        }
        if (s == l) {
            return false;
        }
        if (rel == "beside" || rel == "leftof" || rel == "rightof") {
            return true;
        }
        var objectSize = state.objects[s].size;
        var targetSize = state.objects[l].size;
        var objectShape = state.objects[s].form;
        var targetShape = state.objects[l].form;
        if (rel == "under") {
            return !(objectShape == "ball" || (objectSize == "small" && targetSize == "large"));
        }
        if (objectSize == "large" && targetSize == "small") {
            return false;
        }
        if (targetShape == "ball") {
            return false;
        }
        if (rel != "above") {
            return allowedRelation(s, l, state);
        }
        return true;
    }
    function allowedRelation(s, l, state) {
        var objectSize = state.objects[s].size;
        var targetSize = state.objects[l].size;
        var objectShape = state.objects[s].form;
        var targetShape = state.objects[l].form;
        if (targetShape == "box") {
            if (objectShape == "pyramid" || objectShape == "box" || objectShape == "plank") {
                if (!(targetSize == "large" && objectSize == "small")) {
                    return false;
                }
            }
        }
        if (objectShape == "ball" && !(targetShape == "floor" || targetShape == "box")) {
            return false;
        }
        if (objectShape == "box" && objectSize == "small") {
            if (targetSize == "small" && (targetShape == "pyramid" || targetShape == "brick")) {
                return false;
            }
        }
        if (objectSize == "large" && objectShape == "box") {
            return !(targetShape == "pyramid");
        }
        return true;
    }
    function interpretEntity(ent, state) {
        if (ent.quantifier == "the" || ent.quantifier == "any") {
            return interpretObject(ent.object, state);
        }
        else {
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
                if (currentEntity != "floor") {
                    var eStacks = findStacks(currentEntity, wStacks);
                    if (eStacks.indexOf(currentEntity) != eStacks.length) {
                        var objIndex = eStacks.indexOf(currentEntity) + 1;
                        var aboveEntity = eStacks.slice(objIndex);
                        matchingEntities = matchingEntities.concat(aboveEntity);
                    }
                }
                else {
                    for (var j = 0; j < wStacks.length; j++) {
                        matchingEntities = matchingEntities.concat(wStacks[j]);
                    }
                }
            }
        }
        else if (loc.relation == "ontop") {
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                if (currentEntity != "floor") {
                    var eStacks = findStacks(currentEntity, wStacks);
                    if (eStacks.indexOf(currentEntity) != eStacks.length) {
                        var objIndex = eStacks.indexOf(currentEntity) + 1;
                        matchingEntities.push(eStacks[objIndex]);
                    }
                }
                else {
                    for (var j = 0; j < wStacks.length; j++) {
                        if (wStacks[j].length != 0) {
                            matchingEntities.push(wStacks[j][0]);
                        }
                    }
                }
            }
        }
        else if (loc.relation == "inside") {
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                var eStacks = findStacks(currentEntity, wStacks);
                var objectUnderIndex = eStacks.indexOf(currentEntity);
                var obj = eStacks[objectUnderIndex];
                if (state.objects[obj].form == "box") {
                    matchingEntities.push(eStacks[objectUnderIndex + 1]);
                }
            }
        }
        else if (loc.relation == "under") {
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                var eStacks = findStacks(currentEntity, wStacks);
                if (eStacks[j].indexOf(currentEntity) != 0) {
                    var underEntity = eStacks.slice(0, eStacks.indexOf(currentEntity));
                    matchingEntities = matchingEntities.concat(underEntity);
                }
            }
        }
        else if (loc.relation == "beside") {
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                var eStacks = findStacks(currentEntity, wStacks);
                var indexOfStack = wStacks.indexOf(eStacks);
                var toLeft = indexOfStack - 1;
                var toRight = indexOfStack + 1;
                if (toLeft >= 0) {
                    matchingEntities = matchingEntities.concat(wStacks[toLeft]);
                }
                if (toRight <= wStacks.length) {
                    matchingEntities = matchingEntities.concat(wStacks[toRight]);
                }
            }
        }
        else if (loc.relation == "leftof") {
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                var eStacks = findStacks(currentEntity, wStacks);
                var indexOfStack = wStacks.indexOf(eStacks);
                for (var k = 0; k < indexOfStack; k++) {
                    matchingEntities = matchingEntities.concat(wStacks[k]);
                }
            }
        }
        else if (loc.relation == "rightof") {
            for (var i = 0; i < relationEntities.length; i++) {
                var currentEntity = relationEntities[i];
                var eStacks = findStacks(currentEntity, wStacks);
                var indexOfStack = wStacks.indexOf(eStacks);
                for (var k = indexOfStack + 1; k < wStacks.length; k++) {
                    matchingEntities = matchingEntities.concat(wStacks[k]);
                }
            }
        }
        else {
            return null;
        }
        return matchingEntities;
    }
    function findStacks(ent, stacks) {
        var returnArray = [];
        for (var i = 0; i < stacks.length; i++) {
            if (stacks[i].indexOf(ent) != -1) {
                return stacks[i];
            }
        }
        throw new Error("No mathcing stack");
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
            if (objform == "floor") {
                return ["floor"];
            }
            var tempdefs = new Array();
            for (var _a = 0, objdefs_1 = objdefs; _a < objdefs_1.length; _a++) {
                var o = objdefs_1[_a];
                if (o.form == objform || objform == "anyform") {
                    tempdefs.push(o);
                }
            }
            if (objcolor != null) {
                for (var x = 0; x < tempdefs.length; x++) {
                    var xObj = tempdefs[x];
                    if (xObj.color != objcolor) {
                        removeFromArray(tempdefs, xObj);
                        x--;
                    }
                }
            }
            if (objsize != null) {
                for (var u = 0; u < tempdefs.length; u++) {
                    var uObj = tempdefs[u];
                    if (uObj.size != objsize) {
                        removeFromArray(tempdefs, uObj);
                        u--;
                    }
                }
            }
            var ans = new Array();
            for (var _b = 0, tempdefs_1 = tempdefs; _b < tempdefs_1.length; _b++) {
                var d = tempdefs_1[_b];
                ans.push(keys[objdefs.indexOf(d)]);
            }
            return ans;
        }
        else {
            var subjectStrings = interpretObject(objobj, state);
            var objectStrings = interpretLocation(objloc, state);
            var ansList = subjectStrings.filter(function (n) {
                return objectStrings.indexOf(n) != -1;
            });
            return ansList;
        }
    }
    function removeFromArray(arr, toBeRemoved) {
        var index = arr.indexOf(toBeRemoved);
        arr.splice(index, 1);
    }
})(Interpreter || (Interpreter = {}));
