# Rules

> Non-negotiables. If something here conflicts with a user request, surface the conflict — do not silently override.
>
> **Filling this file:** the bracketed `[...]` placeholders are prompts for the project owner, not instructions for Claude. **Delete any section that doesn't apply** to this project; don't leave empty brackets — they read as instructions and cause confusion.

## Non-Negotiables (always loaded)
1. Never commit secrets, API keys, or `.env` files.
2. Never push directly to `main` / `master`.
3. Never delete files without explicit user confirmation.
4. Never invent function/library names — verify they exist.
5. Always read a file before editing it.

## Architecture
- This template does not hardcode a frontend architecture. The first time `src/` needs a real decision (where does this file go?), decide once, write it to `reference/architecture/[pattern-name].md`, and follow it from then on — see `CONTEXT.md` → "If `reference/architecture/` Is Empty".
- Non-UI code (server, scripts, infra) rarely needs this at all — don't force a pattern on it.

## Design System
[If this project has a design system / token set — Figma variables, a Tailwind config, CSS custom properties — name the canonical source here, e.g. "Colors, spacing, and type scale come from `reference/design-system.md`, generated from Figma variables. Never hardcode a hex value or px value that exists as a token."]
[If no design system exists yet, delete this section rather than leaving it as an instruction to invent one.]

## Code Style
- **Language conventions:** [e.g., TypeScript strict mode, no `any`]
- **Formatting:** [e.g., Prettier defaults, 2-space indent]
- **Imports:** [e.g., absolute paths from `@/`]
- **Comments:** Only when *why* is non-obvious. Never explain *what*.

## Security
- All user input is untrusted until validated.
- Auth checks happen at the route level, not the component level.
- PII never enters logs.

## Compliance
[If applicable: GDPR, HIPAA, SOC2, etc.]

## Testing
- [e.g., New features need a test. Bug fixes need a regression test.]
- [e.g., No `skip` or `only` in committed test files.]

## Git / PR Conventions
- Commit messages: `[task-id] short imperative` (e.g. `feat-012 add dashboard export button`)
- One concern per PR.
- PR description: what changed, why, how tested.
