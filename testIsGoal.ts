///<reference path="World.ts"/>
///<reference path="PlannerTextWorld"/>
///<reference path="Interpreter.ts"/>

function testIsGoal () {
    var DNFformula1 : Interpreter.DNFFormula = [[
        {
            polarity: true,
            relation: "holding",
            args: ["a"]
        }
    ]];
    var exampleWorld1 : WorldState = {
        "stacks": [[],[],[],["b"]],
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
            relation: "holding",
            args: ["a"]
        }
    ]];
    var exampleWorld2 : WorldState = {
        "stacks": [["a"],[],[],[]],
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
            relation: "beside",
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

    var world1 : PlannerTextWorld = new PlannerTextWorld(exampleWorld1, DNFformula1);
    var world2 : PlannerTextWorld = new PlannerTextWorld(exampleWorld2, DNFformula2);
    var world3 : PlannerTextWorld = new PlannerTextWorld(exampleWorld3, DNFformula3);
    console.log(world1.isGoal());
    console.log(world2.isGoal());
    console.log(world3.isGoal());
}

try{
    testIsGoal();
} catch (err) {

}
