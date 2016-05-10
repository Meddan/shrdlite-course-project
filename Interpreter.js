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
        var objects = Array.prototype.concat.apply([], state.stacks);
        if (size != null && color != null) {
            for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                var s = objects_1[_i];
                var a = state.objects(s);
            }
        }
        return false;
    }
})(Interpreter || (Interpreter = {}));
