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
                state.objects;
            }
        }
        else {
        }
        return null;
    }
})(Interpreter || (Interpreter = {}));
