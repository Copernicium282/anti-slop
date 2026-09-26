# Repository guidance

- `src/` is the canonical plugin implementation.
- Keep rules generic and suitable for reuse across repositories. Do not add application-specific names, paths, or exceptions.
- Use Oxlint's ESTree API; do not add another production parser.
- Add focused RuleTester coverage for semantic rule changes.
- `pnpm test` discovers every `src/**/*.test.ts` suite, so a new rule's test needs no package.json entry. Set `ANTI_SLOP_CLI_TESTS=1` (or `pnpm test:cli`) to include the suite that spawns Oxlint as a subprocess; it needs a real `pnpm` executable on `PATH`, so it is skipped on hosts where only a `.cmd` shim exists.
- Read `context.options` inside a visitor, not in `createOnce`. Oxlint registers rules before it binds options, so a value captured while the rule is created is always the default.
- Pass diagnostic interpolation as `{ data: { ... } }`. Spreading the data object into the report descriptor skips placeholder substitution.
- Rule metadata is `type: "problem"`. Oxlint does not surface `suggestion` diagnostics.
- Keep opt-in groups in their own plugin entry point: `effect/index.ts`, `react/index.ts`, and `prose/index.ts`.
- Run `pnpm sync:skill-assets` after changing production source.
- Run `pnpm check` before committing.
