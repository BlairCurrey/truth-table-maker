import { describe, it } from "node:test";
import assert from "node:assert";
import { createSemantics, grammar, parse } from ".";

describe("grammar", () => {
  [
    { expression: "", succeeded: false },
    { expression: "a b", succeeded: false },
    { expression: "()", succeeded: false },
    { expression: "a!", succeeded: false },
    { expression: "!()", succeeded: false },
    { expression: "&&", succeeded: false },
    { expression: "||", succeeded: false },
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
    const testName = `should${
      succeeded ? "" : " not"
    } parse expression: ${expression}`;

    it(testName, (t) => {
      const matchResult = grammar.match(expression);
      assert(matchResult.succeeded() === succeeded, testName);
    });
  });
});

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
