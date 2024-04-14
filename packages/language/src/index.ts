import * as ohm from "ohm-js";

// TODO: re-organize based on usage in website. its kinda dumb to import all these just
// to pass them to eachother (make semantics with grammar, then parse with grammar and semantics)
// Guess maybe it should be a class with grammar on it. then createSemantics and parse as methods.

export const grammar = ohm.grammar(`
  PropLogic {
    Exp = BoolExp
    // BoolExp "->" -- implies
    
    BoolExp = 
      | BoolExp "&&" UnaryExp  --and
      | BoolExp "||" UnaryExp  --or
      | UnaryExp
    
    UnaryExp =
      | "!" Primary             --not
      | Primary
    
    Primary =
      | "(" Exp ")" 		        --group
    | var

    var = letter+
  }
`);

export function createSemantics(
  grammar: ohm.Grammar,
  vars: Record<string, boolean>
): ohm.Semantics {
  return grammar.createSemantics().addOperation("eval", {
    Exp: function (exp) {
      return exp.eval();
    },
    BoolExp_and: function (left, _, right) {
      return left.eval() && right.eval();
    },
    BoolExp_or: function (left, _, right) {
      return left.eval() || right.eval();
    },
    UnaryExp_not: function (_, exp) {
      return !exp.eval();
    },
    Primary_group: function (_, expr, __) {
      return expr.eval();
    },
    var: function (chars) {
      return vars[chars.sourceString as keyof typeof vars];
    },
  });
}

export function parse(
  grammar: ohm.Grammar,
  semantics: ohm.Semantics,
  expression: string
) {
  const matchResult = grammar.match(expression);
  if (matchResult.succeeded()) {
    return semantics(matchResult).eval();
  } else {
    throw new Error(matchResult.message);
  }
}

// TODO: dont do regex. use new ohm create semantics with shared logic for parsing
// (like original, but just doesnt need to resolve the var I guess). Should track
// vars it sees while parsing (with Set?)
export function getVars(expression: string): string[] {
  const regex = /\b[a-zA-Z]+\b/g;
  const vars = expression.match(regex);

  if (!vars) {
    return [];
  }

  const uniqueVars = new Set(vars);

  return Array.from(uniqueVars);
}

// TODO: move to website? kinda just a util for opinionated consumption of the
// other fns. Noticed when going to write tests - basically the same as the manually
// formed semantics tests.
// - counterpoint: what if i wanted to make cli? different site? etc.
export function makeCombos(vars: string[]): Record<string, boolean>[] {
  const combos = [];

  for (let i = 0; i < 2 ** vars.length; i++) {
    const combo: Record<string, boolean> = {};

    for (let j = 0; j < vars.length; j++) {
      const varValue = Boolean(i & (1 << j));
      combo[vars[j]] = varValue;
    }
    combos.push(combo);
  }

  return combos;
}

// Recursive implementation of makeCombos
// export function makeCombos(
//   variables: string[],
//   currentIndex: number = 0,
//   currentAssignment: Record<string, boolean> = {}
// ): Record<string, boolean>[] {
//   // Base case: if currentIndex reaches the end of variables array, return the current assignment
//   if (currentIndex === variables.length) {
//     return [currentAssignment];
//   }

//   const variable = variables[currentIndex];

//   // Recursively generate combinations with variable being true and false
//   const combinationsWithTrue = makeCombos(variables, currentIndex + 1, {
//     ...currentAssignment,
//     [variable]: true,
//   });
//   const combinationsWithFalse = makeCombos(variables, currentIndex + 1, {
//     ...currentAssignment,
//     [variable]: false,
//   });

//   // Combine the combinations
//   return [...combinationsWithTrue, ...combinationsWithFalse];
// }

// Idea behind datastructure is to optimize turning into html table
// last col of each row is the result of the expression for the given vars (all the rest of the columsn)
// [
//   ["a", "b", "a && b"],
//   [false, false, false],
//   [false, true, false],
//   [true, false, false],
//   [true, true, true],
// ];
export function makeTruthTable(expression: string) {
  const vars = getVars(expression);
  const combos = makeCombos(vars);

  const table = [];
  const header = [...vars, expression];

  table.push(header);

  for (const combo of combos) {
    const result = parse(grammar, createSemantics(grammar, combo), expression);
    const row = vars.map((varName) => combo[varName]);
    row.push(result);
    table.push(row);
  }

  return table;
}

const x = [
  ["a", "a"],
  [false, false],
  [true, true],
];

const x2 = [
  ["a", "b", "a && b"],
  [false, false, false],
  [false, true, false],
  [true, false, false],
  [true, true, true],
];
