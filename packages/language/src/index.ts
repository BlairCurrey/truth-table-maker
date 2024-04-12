import * as ohm from "ohm-js";

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
