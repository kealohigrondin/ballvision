import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../eslint-rules/padding-before-function.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("padding-before-function", rule, {
  valid: [
    "const a = () => 1;",
    "const x = 1;\n\nconst f = () => x;",
    "const x = 1;\n\nfunction f() {}",
    "const x = 1;\n\nexport const f = () => x;",
    "const x = 1;\n\n// explains f\nconst f = () => x;",
    "const C = () => {\n  const f = () => 1;\n  return f;\n};",
    "const x = 1;\nconst y = x + 1;",
    "const x = 1;\nconst y = compute(() => x);",
    "const x = 1;\nconst y = useCallback(() => x, []);",
    "const x = 1;\n\nconst y = useMemo(() => x, [x]);",
    "for (const f = () => 1; ; ) {}",
    "switch (a) {\n  case 1:\n    const f = () => 1;\n}",
  ],
  invalid: [
    {
      code: "const x = 1;\nconst f = () => x;",
      output: "const x = 1;\n\nconst f = () => x;",
      errors: [{ messageId: "missing", data: { kind: "function" } }],
    },
    {
      code: "const x = 1;\nconst f = function () {};",
      output: "const x = 1;\n\nconst f = function () {};",
      errors: [{ messageId: "missing" }],
    },
    {
      code: "const x = 1;\nfunction f() {}",
      output: "const x = 1;\n\nfunction f() {}",
      errors: [{ messageId: "missing" }],
    },
    {
      code: "const x = 1;\nexport const f = () => x;",
      output: "const x = 1;\n\nexport const f = () => x;",
      errors: [{ messageId: "missing" }],
    },
    {
      code: "const x = 1;\nconst y = useMemo(() => x, [x]);",
      output: "const x = 1;\n\nconst y = useMemo(() => x, [x]);",
      errors: [{ messageId: "missing", data: { kind: "useMemo" } }],
    },
    {
      code: "const x = 1;\nconst y = React.useMemo(() => x, [x]);",
      output: "const x = 1;\n\nconst y = React.useMemo(() => x, [x]);",
      errors: [{ messageId: "missing", data: { kind: "useMemo" } }],
    },
    {
      code: "const x = 1;\n// explains f\nconst f = () => x;",
      output: "const x = 1;\n\n// explains f\nconst f = () => x;",
      errors: [{ messageId: "missing" }],
    },
    {
      code: "const C = () => {\n  const x = 1;\n  const f = () => x;\n};",
      output: "const C = () => {\n  const x = 1;\n\n  const f = () => x;\n};",
      errors: [{ messageId: "missing" }],
    },
  ],
});
