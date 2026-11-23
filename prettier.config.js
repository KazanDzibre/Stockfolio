// prettier.config.js: Prettier is an opinionated code formatter. It rewrites style
// (quotes, wrapping, commas) so nobody argues about it in code review.
// It ignores everything in .gitignore automatically.

/** @type {import('prettier').Config} */
export default {
  // Always end statements with semicolons (avoids rare automatic-semicolon-insertion bugs).
  semi: true,

  // 'single' quotes, the most common choice in Node/TS codebases.
  singleQuote: true,

  // Trailing commas everywhere possible, so adding a line gives a 1-line diff, not 2.
  trailingComma: "all",

  // Wrap lines longer than 100 characters (80 is cramped with TS types).
  printWidth: 100,

  // 2-space indentation, the JS ecosystem standard.
  tabWidth: 2,

  // Unix line endings everywhere, even if someone edits on Windows.
  endOfLine: "lf",
};
