import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../eslint-rules/padding-before-statements.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

ruleTester.run("padding-before-statements", rule, {
  valid: [
    "const a = () => 1;",
    "const x = 1;\n\nconst f = () => x;",
    "const x = 1;\n\nfunction f() {}",
    "const x = 1;\n\nexport const f = () => x;",
    "const x = 1;\n\n// explains f\nconst f = () => x;",
    "const C = () => {\n  const f = () => 1;\n\n  return f;\n};",
    "const x = 1;\nconst y = x + 1;",
    "const x = 1;\nconst y = compute(() => x);",
    "const x = 1;\n\nconst y = useCallback(() => x, []);",
    "const x = 1;\n\nconst y = useMemo(() => x, [x]);",
    "for (const f = () => 1; ; ) {}",
    "const f = () => {\n  return 1;\n};",
    "const f = () => {\n  const x = 1;\n\n  return x;\n};",
    "const f = () => {\n  if (a) {\n    return 1;\n  }\n};",
    "const f = () => {\n  switch (a) {\n    case 1:\n      return 1;\n  }\n};",
    "const x = 1;\n\ntry {\n  x();\n} catch {}",
    "const f = () => {\n  try {\n    x();\n  } catch {}\n};",
    "const x = 1;\n\nuseEffect(() => {}, [x]);",
    "const C = () => {\n  useEffect(() => {}, []);\n};",
    "const x = 1;\nsomethingElse(() => x);",
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
    {
      code: "const x = 1;\nuseEffect(() => {}, [x]);",
      output: "const x = 1;\n\nuseEffect(() => {}, [x]);",
      errors: [{ messageId: "missing", data: { kind: "useEffect" } }],
    },
    {
      code: "const x = 1;\nReact.useEffect(() => {}, [x]);",
      output: "const x = 1;\n\nReact.useEffect(() => {}, [x]);",
      errors: [{ messageId: "missing", data: { kind: "useEffect" } }],
    },
    {
      code: "const x = 1;\nconst f = useCallback(() => x, [x]);",
      output: "const x = 1;\n\nconst f = useCallback(() => x, [x]);",
      errors: [{ messageId: "missing", data: { kind: "useCallback" } }],
    },
    {
      code: "const f = () => {\n  const x = 1;\n  return x;\n};",
      output: "const f = () => {\n  const x = 1;\n\n  return x;\n};",
      errors: [{ messageId: "missing", data: { kind: "return" } }],
    },
    {
      code: "const x = 1;\ntry {\n  x();\n} catch {}",
      output: "const x = 1;\n\ntry {\n  x();\n} catch {}",
      errors: [{ messageId: "missing", data: { kind: "try" } }],
    },
  ],
});
