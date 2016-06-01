No extensions are implemented in this project. 

We have, however, used a collections library in order to facilitate mainly the A* search, as mentioned in that ReadMe. 
Furthermore, the A* search is altered as the previous solution required a consistent heuristic rather than just an admissable one.

The interpreter does better as well - it does now also consider objects held by the robot arm, and interprets the missing command 
for dropping an already held object. 

The planner is implemented as one might expect - a fitting world is extended from TextWorld.ts (we removed two statements from the constructor as we did not want the world to
reset when it was created). The extended PlannerTextWorld contains a goal check function as well as clone functions, which returns a copy of the world after each one of the
four possible actions. These are, of course, used when creating the graph which is used for the A* search. The graph (StateGraph) also contains the heuristic. 
The heuristic checks sideways distance between objects as well as how far dowm in a stack a requested item is found.  

