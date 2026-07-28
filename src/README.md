# src/ — Your Actual Code

This template does not hardcode a frontend architecture. Folder structure here is a per-project decision, made once it's needed and documented in `reference/architecture/`.

## First Time You Need to Decide

When a task asks "where does this file go?" and there's no answer yet:

1. Don't invent a structure silently, and don't default to a heavyweight pattern for a five-file prototype.
2. Ask what fits: a named methodology (Feature-Sliced Design, Atomic Design, Next.js App Router conventions, ...), or just "components/ + lib/, no ceremony yet."
3. Write the decision to `reference/architecture/[pattern-name].md` — see `reference/architecture/README.md` for the format.
4. From then on, this folder follows that document. New files get placed per its rules, not per whatever feels convenient in the moment.

## Until Then

Organize `src/` however is obviously reasonable for the current size of the project. Revisit once the "where does this go" question stops having an obvious answer.
