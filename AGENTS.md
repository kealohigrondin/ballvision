# Repository standards

- Use React with strict TypeScript; avoid `any`.
- prefer const arrow functions over function declarations
- avoid using conditional rendering in the jsx. establish what is going to be rendered prior to returning jsx
- Build reusable components with a single clear responsibility.
- each component file should have one responsibility
- Each component should have it's own file
- Keep ESPN-specific logic in src/data/espn.ts.
- Keep network and refresh logic out of UI components.
- Depend on ScoreboardSource for provider access.
- Prefer low coupling and high cohesion.
- Use semantic HTML and accessible controls.
- Add meaningful tests for behavior changes and bug fixes.
- Run npm test and npm run build before completing changes.
- Run locally only. Do not publish or deploy.