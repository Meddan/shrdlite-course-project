///<reference path="World.ts"/>
///<reference path="PlannerTextWorld"/>
///<reference path="Interpreter.ts"/>

function testIsGoal () {
    var DNFformula1 : Interpreter.DNFFormula = [[
        {
            polarity: true,
            relation: "ontop",
            args: ["a", "floor"]
        }
    ]];
    var exampleWorld1 : WorldState = {
        "stacks": [["b","a"],[],[],[]],
        "holding": null,
        "arm": 0,
        "objects": {
            "a": { "form":"brick",   "size":"large",  "color":"yellow" },
            "b": { "form":"brick",   "size":"small",  "color":"white" }
        },
        "examples": []
    };

    var DNFformula2 : Interpreter.DNFFormula = [[
        {
            polarity: true,
            relation: "ontop",
            args: ["a", "b"]
        }
    ]];
    var exampleWorld2 : WorldState = {
        "stacks": [["b","a"],[],[],[]],
        "holding": null,
        "arm": 0,
        "objects": {
            "a": { "form":"brick",   "size":"large",  "color":"yellow" },
            "b": { "form":"brick",   "size":"small",  "color":"white" }
        },
        "examples": []
    };

    var DNFformula3 : Interpreter.DNFFormula = [[
        {
            polarity: true,
            relation: "ontop",
            args: ["a","b"]
        }
    ]];
    var exampleWorld3 : WorldState = {
        "stacks": [["a"],[],[],["b"]],
        "holding": null,
        "arm": 0,
        "objects": {
            "a": { "form":"brick",   "size":"large",  "color":"yellow" },
            "b": { "form":"brick",   "size":"small",  "color":"white" }
        },
        "examples": []
    };

    var DNFformula4 : Interpreter.DNFFormula = [[
        {
            polarity: true,
            relation: "inside",
            args: ["a", "a"]
        }
    ]];
    var exampleWorld4 : WorldState = {
        "stacks": [["b","a"],[],[],[]],
        "holding": null,
        "arm": 0,
        "objects": {
            "a": { "form":"brick",   "size":"large",  "color":"yellow" },
            "b": { "form":"brick",   "size":"small",  "color":"white" }
        },
        "examples": []
    };

    var DNFformula5 : Interpreter.DNFFormula = [[
        {
            polarity: true,
            relation: "inside",
            args: ["a", "b"]
        }
    ]];
    var exampleWorld5 : WorldState = {
        "stacks": [["b","a"],[],[],[]],
        "holding": null,
        "arm": 0,
        "objects": {
            "a": { "form":"brick",   "size":"large",  "color":"yellow" },
            "b": { "form":"brick",   "size":"small",  "color":"white" }
        },
        "examples": []
    };

    var DNFformula6 : Interpreter.DNFFormula = [[
        {
            polarity: true,
            relation: "inside",
            args: ["a","b"]
        }
    ]];
    var exampleWorld6 : WorldState = {
        "stacks": [["c","a"],[],[],["b"]],
        "holding": null,
        "arm": 0,
        "objects": {
            "a": { "form":"brick",   "size":"large",  "color":"yellow" },
            "b": { "form":"brick",   "size":"small",  "color":"white" },
            "c": { "form":"brick",   "size":"large",  "color":"yellow" }
        },
        "examples": []
    };

    var world1 : PlannerTextWorld = new PlannerTextWorld(exampleWorld1, DNFformula1);
    var world2 : PlannerTextWorld = new PlannerTextWorld(exampleWorld2, DNFformula2);
    var world3 : PlannerTextWorld = new PlannerTextWorld(exampleWorld3, DNFformula3);
    console.log("Should be false: " + world1.isGoal());
    console.log("Should be true: " + world2.isGoal());
    console.log("Should be false: " + world3.isGoal());
    console.log("more tests");
    var world4 : PlannerTextWorld = new PlannerTextWorld(exampleWorld4, DNFformula4);
    var world5 : PlannerTextWorld = new PlannerTextWorld(exampleWorld5, DNFformula5);
    var world6 : PlannerTextWorld = new PlannerTextWorld(exampleWorld6, DNFformula6);
    console.log("Should be false: " + world4.isGoal());
    console.log("Should be true: " + world5.isGoal());
    console.log("Should be false: " + world6.isGoal());
}

try{
    testIsGoal();
} catch (err) {

}
