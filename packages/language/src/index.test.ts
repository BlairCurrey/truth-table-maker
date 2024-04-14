import { describe, it } from "node:test";
import assert from "node:assert";
import {
  createSemantics,
  grammar,
  parse,
  getVars,
  makeCombos,
  makeTruthTable,
} from ".";

describe("grammar", () => {
  [
    { expression: "", succeeded: false },
    { expression: "a b", succeeded: false },
    { expression: "()", succeeded: false },
    { expression: "a!", succeeded: false },
    { expression: "!()", succeeded: false },
    { expression: "&&", succeeded: false },
    { expression: "||", succeeded: false },
    { expression: "a1", succeeded: false },
    { expression: "1 && 2", succeeded: false },
    { expression: "a", succeeded: true },
    { expression: "A", succeeded: true },
    { expression: "camelCase", succeeded: true },
    // TODO: support these or nah?
    // { expression: "snake_case", succeeded: true },
    // { expression: "kebab-case", succeeded: true },
    // { expression: "varWithNumber1", succeeded: true },
    // { expression: "varWith@Symbol", succeeded: true },
    { expression: "(a)", succeeded: true },
    { expression: "!a", succeeded: true },
    { expression: "a && b", succeeded: true },
    { expression: "aye && bee", succeeded: true },
    { expression: "a || b", succeeded: true },
    { expression: "!a || b", succeeded: true },
    { expression: "(!a) || (!b)", succeeded: true },
    { expression: "!(a)", succeeded: true },
    { expression: "!(a && b)", succeeded: true },
    { expression: "(a && b) || !c", succeeded: true },
    { expression: "a || b && c", succeeded: true },
  ].forEach(({ expression, succeeded }) => {
    // TODO: this is for grammar match and parse is done elsewhere... maybe testname is misleading?
    const testName = `should${
      succeeded ? "" : " not"
    } parse expression: ${expression}`;

    it(testName, (t) => {
      const matchResult = grammar.match(expression);
      assert(matchResult.succeeded() === succeeded, testName);
    });
  });
});

// TODO: rename: this? also tests parse
describe("semantics", () => {
  const semanticsTestCases: {
    // vars should have all variables used in the expression.
    expression: string;
    vars: Record<string, boolean>;
    expected: boolean;
  }[] = [
    {
      expression: "a",
      vars: {
        a: true,
      },
      expected: true,
    },
    {
      expression: "a",
      vars: {
        a: false,
      },
      expected: false,
    },
    {
      expression: "!a",
      vars: {
        a: true,
      },
      expected: false,
    },
    {
      expression: "!a",
      vars: {
        a: false,
      },
      expected: true,
    },
    {
      expression: "a && b",
      vars: {
        a: true,
        b: true,
      },
      expected: true,
    },
    {
      expression: "a && b",
      vars: {
        a: true,
        b: false,
      },
      expected: false,
    },
    {
      expression: "a || b",
      vars: {
        a: true,
        b: false,
      },
      expected: true,
    },
    {
      expression: "a || b",
      vars: {
        a: false,
        b: false,
      },
      expected: false,
    },
    {
      expression: "!a || b",
      vars: {
        a: true,
        b: false,
      },
      expected: false,
    },
    {
      expression: "(!a) || (!b)",
      vars: {
        a: true,
        b: false,
      },
      expected: true,
    },
    {
      expression: "!(a)",
      vars: {
        a: true,
      },
      expected: false,
    },
    {
      expression: "!(a && b)",
      vars: {
        a: true,
        b: false,
      },
      expected: true,
    },
    {
      expression: "(a && b) || !c",
      vars: {
        a: true,
        b: false,
        c: true,
      },
      expected: false,
    },
    {
      expression: "!a || !b",
      vars: {
        a: true,
        b: false,
      },
      expected: true,
    },
  ];

  semanticsTestCases.forEach(({ expression, vars, expected }) => {
    const testName = `should resolve to ${expected} for expression: ${expression} and vars ${JSON.stringify(
      vars
    )}`;

    it(testName, (t) => {
      const semantics = createSemantics(grammar, vars);
      const res = parse(grammar, semantics, expression);
      assert(res === expected);
    });
  });
});

describe("getVars", () => {
  [
    { expression: "a", expected: ["a"] },
    { expression: "", expected: [] },
    { expression: "A", expected: ["A"] },
    { expression: "Something", expected: ["Something"] },
    { expression: "something", expected: ["something"] },
    // TODO: support numbers? does parser?
    // { expression: "a1", expected: [] },
    { expression: "a || b", expected: ["a", "b"] },
    { expression: "something && another", expected: ["something", "another"] },
    { expression: "!something", expected: ["something"] },
    { expression: "!(something||another)", expected: ["something", "another"] },
    { expression: "a || b || a", expected: ["a", "b"] },
  ].forEach(({ expression, expected }) => {
    it(`gets var names: ${expected} from: ${expression}`, (t) => {
      const vars = getVars(expression);

      assert(vars.length === expected.length);
      vars.forEach((v) => {
        assert(expected.includes(v));
      });
    });
  });
});

describe("makeCombos", () => {
  [
    { vars: ["a"], expected: [{ a: false }, { a: true }] },
    {
      vars: ["Aye", "Bee"],
      expected: [
        { Aye: false, Bee: false },
        { Aye: true, Bee: false },
        { Aye: false, Bee: true },
        { Aye: true, Bee: true },
      ],
    },
    {
      vars: ["a", "b", "c"],
      expected: [
        {
          a: false,
          b: false,
          c: false,
        },
        {
          a: true,
          b: false,
          c: false,
        },
        {
          a: false,
          b: true,
          c: false,
        },
        {
          a: true,
          b: true,
          c: false,
        },
        {
          a: false,
          b: false,
          c: true,
        },
        {
          a: true,
          b: false,
          c: true,
        },
        {
          a: false,
          b: true,
          c: true,
        },
        {
          a: true,
          b: true,
          c: true,
        },
      ],
    },
  ].forEach(({ vars, expected }) => {
    it("makes combos correctly", (t) => {
      const combos = makeCombos(vars);
      assert(combos.length === expected.length);
      assert.deepEqual(combos, expected);
    });
  });
});

describe("makeTruthTable", () => {
  [
    {
      expression: "a",
      expected: [
        ["a", "a"],
        [false, false],
        [true, true],
      ],
    },
    {
      expression: "Aye && Bee",
      expected: [
        ["Aye", "Bee", "Aye && Bee"],
        [false, false, false],
        [true, false, false],
        [false, true, false],
        [true, true, true],
      ],
    },
    {
      expression: "(a || b) && !c",
      expected: [
        ["a", "b", "c", "(a || b) && !c"],
        [false, false, false, false],
        [true, false, false, true],
        [false, true, false, true],
        [true, true, false, true],
        [false, false, true, false],
        [true, false, true, false],
        [false, true, true, false],
        [true, true, true, false],
      ],
    },
  ].forEach(({ expression, expected }) => {
    it("makes truth tables correctly", () => {
      const table = makeTruthTable(expression);
      assert.deepEqual(table, expected);
    });
  });
});
