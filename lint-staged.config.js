/** @type {import('lint-staged').Configuration} */
export default {
  // Lint only the staged files.
  '*.{js,jsx,ts,tsx}': 'eslint --max-warnings=0',
  // Typecheck and tests are project-wide, so run them once (ignoring file args)
  // whenever any TS/JS file is staged.
  '*.{ts,tsx,js,jsx,mts,cts}': () => ['npm run typecheck', 'npm test'],
}
