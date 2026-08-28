# Wiki Log

> Chronological, append-only record of what happened in the wiki.
> Format: `## [YYYY-MM-DD] <operation> | <title>` followed by a short note.
> Operations: `ingest`, `query`, `lint`, `decision`, `feat`, `fix`, `refactor`, `docs`, `housekeep`.
>
> **`decision` entries:** a plain approval that contradicted nothing stays a short note. A
> contradiction resolved under `.context/rules.md` (non-negotiable 6) uses this shape instead,
> still under one `## [YYYY-MM-DD] decision | <title>` heading:
> **Decided:** verbatim — the user's own words. **Contradicts:** `file:line` + the line quoted,
> or `nothing`. **Option:** spec-update | exception | withdrawn. **Propagated:** files touched,
> or `none`.
>
> Quick scan with: `grep "^## \[" log.md | tail -10`

<!-- new entries go below this line -->

## [2026-08-28] decision | push directly to main — one-off exception

**Decided:** "option 2, exception this time"
**Contradicts:** `.context/rules.md:9` — "Never push directly to `main` / `master`."
**Option:** exception
**Propagated:** none — `main` pushed as-is for this session's 3 commits; the rule stays in force, future work should use a branch + PR.
