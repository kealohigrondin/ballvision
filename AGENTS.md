# Repository standards

## Code standards

- Use React with strict TypeScript; avoid `any`.
- prefer const arrow functions over function declarations
- Keep JSX conditional rendering to one layer; do not nest render conditions.
- For render-or-nothing cases, write the `&&` check directly where the element is rendered in JSX. Do not assign conditional JSX to a `const` and then render that variable. Use boolean conditions (for example, `items.length > 0`) to avoid rendering `0`.
- Establish two-way or multi-branch render choices before returning JSX. Keep conditional class names directly in `className` using `clsx` and `&&`.

- Style components with MUI `sx`. Keep one-off styles inline and extract shared patterns into reusable components or shared `sx` objects. Do not add standalone CSS stylesheets.
- Store shared design tokens in the MUI app theme. Use `MuiCssBaseline` for font registration and browser-wide defaults.
- Build reusable components with a single clear responsibility.
- for functional components, define a props type with the name ComponentNameProps. destructure props in declaration
- each component file should have one responsibility
- Each component should have it's own file
- Put all user-facing UI copy (text, labels, aria-labels, titles, placeholders) in src/copy.ts and reference it from components. In tests, query by `copy` entries rather than hardcoded strings so wording changes do not break tests.
- Prefer low coupling and high cohesion.
- prefer optional props to `type | null` props. use a default value of '' for strings for example
- For new UI components, keep them general and reusable. Do not make them specific to a feature
- for variables that need more than one inline if statement to determine its value, use usememo to determine value
- use prettier formatting in all files

## Styling

- Use MUI components, theming, and styling.
- For new UI components, follow [material design 3](https://m3.material.io/components) unless specified otherwise

## Data

- Keep ESPN-specific logic in src/data/espn.ts.
- Keep network and refresh logic out of UI components.
- Add meaningful tests for behavior changes and bug fixes.
- for api calls, prefer storing the data in context and access via providers rather than prop drilling

## CI

- Run npm test and npm run build before completing changes.
- For UI changes, also run `npm run test:e2e`, add or update Playwright specs in `e2e/` when user-visible behavior changes, and run `npm run screenshots` to check the result visually. Extend `e2e/screenshots.spec.ts` when a change is not visible in the existing shots. CI posts these screenshots to the PR automatically.
- For each changed UI component, add `@screenshots` tests in `e2e/screenshots.spec.ts` that capture just that component with `locator.screenshot` in each of its states (for example loading, empty, error, populated and expanded), saved as `screenshots/<component>-<state>.png`. Set up each state with the mocked APIs in `e2e/support/mockApis.ts`.
- After opening a pull request, subscribe to its activity so review comments and CI failures get addressed.

## Testing

- each test should test singular functions rather than a series of events
- unit tests should only test UI functions and states, not whether or not certain styles render
- To find DOM elements in tests, give them an `id` and query by it. When a component can render more than once on a page, include a distinguishing value in the `id` so it stays unique, e.g. `league-table-title-${titleId}` where `titleId` is the table title lowercased with spaces and symbols replaced by `-`.
