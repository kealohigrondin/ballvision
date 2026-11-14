@AGENTS.md

## Agent skills

Skills live in `.agents/skills/<name>/`. Before starting a task, read the
`SKILL.md` of every skill that applies, then the `references/` files it points
to for the rules you're working with. This file's rules win when a skill
disagrees.

- `feature-arch`: anything that adds or moves files, creates a feature, or
  touches imports between `app`, `features` and `shared`
- `react`: components, hooks and context providers
- `typescript`: types, async code and module imports
- `vitest`: unit tests in `tests/`
- `playwright`: e2e and screenshot tests in `e2e/`
- `ui-design`: new or changed UI
- `web-design-guidelines`: reviewing UI before opening a PR
- `msw`, `zod`: only if those libraries are added to the project

This is a client-side Vite app. Skip skill rules about Next.js, Server
Components, server actions and the App Router.
