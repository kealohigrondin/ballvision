/**
 * Require a blank line before function declarations, function-valued
 * variable declarations (arrow or function expressions), and useMemo
 * declarations. The first statement in a block is exempt. Leading comments
 * are treated as part of the statement.
 */

const STATEMENT_PARENTS = new Set([
  "Program",
  "BlockStatement",
  "StaticBlock",
  "SwitchCase",
]);

const isFunctionValue = (init) =>
  init?.type === "ArrowFunctionExpression" ||
  init?.type === "FunctionExpression";

const isUseMemoCall = (init) => {
  if (init?.type !== "CallExpression") return false;
  const { callee } = init;
  if (callee.type === "Identifier") return callee.name === "useMemo";
  return (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "useMemo"
  );
};

const statementOf = (node) =>
  node.parent?.type === "ExportNamedDeclaration" ||
  node.parent?.type === "ExportDefaultDeclaration"
    ? node.parent
    : node;

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    docs: {
      description:
        "Require a blank line before function and useMemo declarations",
    },
    messages: {
      missing: "Expected a blank line before this {{kind}} declaration.",
    },
    schema: [],
  },
  create: (context) => {
    const { sourceCode } = context;

    const check = (node, kind) => {
      const statement = statementOf(node);
      if (!STATEMENT_PARENTS.has(statement.parent?.type)) return;

      const comments = sourceCode.getCommentsBefore(statement);
      let start = statement;
      for (let i = comments.length - 1; i >= 0; i -= 1) {
        if (comments[i].loc.end.line < start.loc.start.line - 1) break;
        start = comments[i];
      }

      const previous = sourceCode.getTokenBefore(start, {
        includeComments: true,
      });
      if (!previous) return;
      if (previous.type === "Punctuator" && previous.value === "{") return;
      if (previous.type === "Punctuator" && previous.value === ":") return;
      if (start.loc.start.line - previous.loc.end.line > 1) return;
      if (start.loc.start.line === previous.loc.end.line) return;

      context.report({
        node: statement,
        messageId: "missing",
        data: { kind },
        fix: (fixer) => {
          const lineStart = sourceCode.getIndexFromLoc({
            line: start.loc.start.line,
            column: 0,
          });
          return fixer.insertTextBeforeRange([lineStart, lineStart], "\n");
        },
      });
    };

    return {
      FunctionDeclaration: (node) => check(node, "function"),
      VariableDeclaration: (node) => {
        const inits = node.declarations.map((declarator) => declarator.init);
        if (inits.some(isFunctionValue)) check(node, "function");
        else if (inits.some(isUseMemoCall)) check(node, "useMemo");
      },
    };
  },
};

export default rule;
