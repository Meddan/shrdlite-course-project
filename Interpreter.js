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
        var possibleSubj;
        possibleObj = interpretEntity(cmdent, state);
        possibleSubj = interpretLoc(cmdloc, state);
        var entobj = cmdent.object;
        interpretObject(entobj, state);
        var objects = Array.prototype.concat.apply([], state.stacks);
        var a = objects[Math.floor(Math.random() * objects.length)];
        var b = objects[Math.floor(Math.random() * objects.length)];
        var interpretation = [[
                { polarity: true, relation: "ontop", args: [a, "floor"] },
                { polarity: true, relation: "holding", args: [b] }
            ]];
        return interpretation;
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
        var relationEnteties = interpretEntity(loc.entity, state);
        if (loc.relation == "above") {
        }
        return null;
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
        }
        return null;
    }
    function removeFromArray(arr, toBeRemoved) {
        var index = arr.indexOf(toBeRemoved);
        arr.splice(index, 1);
    }
})(Interpreter || (Interpreter = {}));
