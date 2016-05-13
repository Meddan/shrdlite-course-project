We expect our implementation of this submission to look more or less like expected.
interpretCommand now works as described below:
From the command, we can find the object to be manipulated as well as the target location for said manipulation.
We do this by finding all objects that match the "description" for both the object and the "target", 
and after that filter the combinations that are not allowed by the environment rules. 
Finally, we return all feasible literals as a DNFFormula. 

Functions added are
allowedRelations: checks if two forms may be stacked or not given the world rules.
interpretEntity: currently only lets through two quantifiers and then calls interpretObject
interpretLocation: Finds all possible locations that may be referenced by an entity and a relation.
interpretObject: Finds all objects matching a given definition
findStacks: finds all stacks containing a certain entity
removeFromArray: Self-explanatory.