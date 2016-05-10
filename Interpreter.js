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
    function interpretObject(obj, state) {
        if (obj.object == null) {
            var color = obj.color;
            var size = obj.size;
            var form = obj.form;
            if (size != null && color != null) {
                var objdef;
                objdef.form = form;
                objdef.size = size;
                obj;
                state.objects;
            }
        }
        else {
        }
        return null;
    }
    function findObj(obj, state) {
        var color = obj.color;
        var size = obj.size;
        var form = obj.form;
        var object = obj.object;
        var location = obj.location;
        var keys = Array.prototype.concat.apply([], state.stacks);
        var objdefs = new Array();
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var s = keys_1[_i];
            objdefs.push(state.objects[s]);
        }
        if (object == null) {
            var tempdefs = new Array();
            for (var _a = 0, objdefs_1 = objdefs; _a < objdefs_1.length; _a++) {
                var o = objdefs_1[_a];
                if (o.form == form) {
                    tempdefs.push(o);
                }
            }
            if (color != null) {
                for (var _b = 0, tempdefs_1 = tempdefs; _b < tempdefs_1.length; _b++) {
                    var u = tempdefs_1[_b];
                    if (u.color != color) {
                        removeFromArray(tempdefs, u);
                    }
                }
            }
            if (size != null) {
                for (var _c = 0, tempdefs_2 = tempdefs; _c < tempdefs_2.length; _c++) {
                    var u = tempdefs_2[_c];
                    if (u.size != size) {
                        removeFromArray(tempdefs, u);
                    }
                }
            }
            if (tempdefs.length == 1) {
                return keys[objdefs.indexOf(tempdefs[0])];
            }
            else {
                return null;
            }
        }
        else {
        }
        return null;
    }
    function removeFromArray(arr, toBeRemoved) {
        var index = arr.indexOf(toBeRemoved);
        arr.splice(index, 1);
    }
})(Interpreter || (Interpreter = {}));
