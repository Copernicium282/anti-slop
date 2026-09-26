---
name: install-anti-slop
description: Install, configure, update, or upgrade vendored anti-slop Oxlint plugins. Use when adding anti-slop, picking up upstream rules or fixes, or migrating an existing installation while preserving local customizations.
---

# Install or update anti-slop

Anti-slop is vendored code: the target repository owns its rules, diagnostics, tests, and configuration. Preserve those choices when bringing in upstream changes.

## Choose the path

Read the repository's agent instructions and `git status`. Identify its package manager, Oxlint/Vite+ configuration, and any existing anti-slop entry points, including renamed or relocated copies referenced by `jsPlugins`.

- **Existing installation — update, upgrade, migrate, or reconfigure:** read [Update a vendored installation](references/update.md) and follow that procedure instead of the fresh-install steps below.
- **No installation — fresh install:** follow the procedure below. If the user requested an update but no installation can be found, confirm the target before installing.

Complete when the operation and target path are established and pre-existing work is identified.

## Fresh install

1. Copy the bundled plugin from this skill. Run from the target repository:

   ```bash
   node <skill-directory>/scripts/install.mjs
   ```

   This creates `tools/oxlint/anti-slop/`. Pass another relative destination as the first argument when the repository has an established tooling layout. The script refuses to replace an existing destination; route existing copies through the update procedure rather than `--force`.

   Preserve the nested `vendor/eslint-stylistic/LICENSE` and `UPSTREAM.md`; they travel with the copied rule. Readability enforcement is self-contained and requires no Stylistic plugin dependency.

   Complete when the files, including vendored license and provenance, exist at the agreed destination without replacing an existing copy.

2. Install current compatible dependencies rather than trusting versions remembered by the agent:
   - If the repository already depends on `oxlint`, read its installed version from the package manager or lockfile and install `@oxlint/plugins` at exactly that version. Pin it exactly rather than by range so future upgrades move both packages together.
   - Only when the repository has no `oxlint` dependency, query `npm view oxlint version` and `npm view @oxlint/plugins version`, then install the same current version of both packages.
   - `oxlint` is a development dependency. The copied source imports `@oxlint/plugins`, so install it as a development dependency for a local-only plugin.
   - Do not replace the package manager or rewrite unrelated dependency ranges.

   Complete when matching compatible versions are installed and unrelated dependency ranges are preserved.

3. Register the generic plugin, configure ignores, and enable all generic rules. For `oxlint.config.ts` or `.oxlintrc.json`, merge these fields with the existing configuration:

   ```ts
   ignorePatterns: [
     ".agent/**",
     ".agents/**",
     ".claude/**",
     ".codex/**",
     ".continue/**",
     ".cursor/**",
     ".gemini/**",
     ".opencode/**",
     ".pi/**",
     ".roo/**",
     ".windsurf/**",
     "tools/oxlint/anti-slop/**",
   ],
   jsPlugins: [
     { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
   ],
   ```

   Keep every existing ignore. Adjust the final pattern when the plugin was copied elsewhere. Inspect the repository for other project-local agent tooling directories and add them rather than linting installed skills, hooks, or generated agent configuration as application source. Do not broadly ignore all dot-directories, because some repositories keep owned source or checks in them.

   For Vite+, add these fields to `lint.ignorePatterns` and `lint.jsPlugins`. Also merge the same patterns into `fmt.ignorePatterns` so `vp check` does not reformat installed agent assets or the vendored plugin. Merge existing entries instead of replacing them.

   Enable these rules at `"error"`, including the native Oxlint companion rule:

   ```json
   {
     "oxc/no-accumulating-spread": "error",
     "anti-slop/no-array-filter-map": "error",
     "anti-slop/no-async-promise-executor": "error",
     "anti-slop/no-chained-type-assertions": "error",
     "anti-slop/no-conditional-empty-object-spread": "error",
     "anti-slop/no-empty-object-type": "error",
     "anti-slop/no-enum-declaration": "error",
     "anti-slop/no-global-regex-replace": "error",
     "anti-slop/no-import-assertions": "error",
     "anti-slop/no-json-clone-round-trip": "error",
     "anti-slop/no-known-value-widening": "error",
     "anti-slop/no-legacy-has-own-property": "error",
     "anti-slop/no-legacy-namespace-keyword": "error",
     "anti-slop/no-module-mocking": "error",
     "anti-slop/no-object-parameters": "error",
     "anti-slop/no-parameter-property": "error",
     "anti-slop/no-reduce-accumulator-copy": "error",
     "anti-slop/no-reduce-grouping": "error",
     "anti-slop/no-reflect-apply": "error",
     "anti-slop/no-reflect-get": "error",
     "anti-slop/no-runtime-typeof": "error",
     "anti-slop/no-string-execution": "error",
     "anti-slop/no-shape-in-symbol-names": "error",
     "anti-slop/no-unknown-parameters": "error",
     "anti-slop/no-unknown-returns": "error",
     "anti-slop/no-unknown-type-aliases": "error",
     "anti-slop/no-unsafe-dictionary-type": "error",
     "anti-slop/no-unsafe-enum-comparison": "error",
     "anti-slop/no-unsupported-jsdoc-tag": "error",
     "anti-slop/no-widen-then-assert": "error",
     "anti-slop/no-wrapper-object-types": "error",
     "anti-slop/require-readable-spacing": "error",
     "anti-slop/require-safety-comment-for-type-assertion": "error"
   }
   ```

   Treat these as intentional policy rather than noise to silence. `no-enum-declaration`, `no-parameter-property`, and `no-legacy-namespace-keyword` reject syntax that TypeScript 7 either cannot erase or no longer accepts. `no-empty-object-type`, `no-wrapper-object-types`, `no-unsafe-enum-comparison`, `no-async-promise-executor`, `no-json-clone-round-trip`, `no-legacy-has-own-property`, `no-global-regex-replace`, `no-string-execution`, and `no-reduce-grouping` each replace a pattern with the form the current documentation recommends. Do not resolve a finding by weakening a type, re-adding an `as`, or lowering the rule's severity; use the replacement the message names. When a repository has a real exception (an enum that must remain an enum, a required `export =`), report it to the user instead of editing the vendored rule.

   For `no-array-filter-map`, prefer lazy `.values().filter(...).map(...).toArray()` pipelines only when the target runtime supports iterator helpers; otherwise use an appropriate single `flatMap` or locally mutating reducer. Review callback order, indexes, sparse arrays, `thisArg`, and filtering semantics rather than mechanically rewriting chains. Unknown receiver types are deliberately not inferred by this AST/scope rule.

   Pair `no-reduce-accumulator-copy` with native `oxc/no-accumulating-spread`: the custom rule catches supported non-spread copies such as `Object.assign({}, acc, item)`, `Array.from(acc)`, and array accumulator `concat`/`slice` calls. Mutating a fresh local accumulator is allowed; copying individual input items is also allowed. Named callbacks, indirect helpers, and nested accumulator properties are not fully analyzed, so do not claim all quadratic reducers are ruled out.

   If the repository declares `effect` in a package manifest, or the user explicitly requests Effect rules, also register the opt-in Effect plugin:

   ```ts
   jsPlugins: [
     {
       name: "anti-slop-effect",
       specifier: "./tools/oxlint/anti-slop/effect/index.ts",
     },
   ],
   rules: {
     "anti-slop-effect/no-manual-effect-error-tag": "error",
     "anti-slop-effect/no-manual-tag-comparison": "error",
     "anti-slop-effect/no-manual-tagged-construction": "error",
     "anti-slop-effect/no-service-constructor-imports": "error",
     "anti-slop-effect/prefer-effect-match": "error",
   },
   ```

   Merge these entries with the generic plugin configuration rather than replacing it. Do not enable the Effect plugin merely because Effect appears transitively in a lockfile; require a direct package-manifest dependency or an explicit user request. The rule covers relative project imports. Report package-alias imports as a current limitation rather than pretending they are enforced.

   If the repository declares `react` in a package manifest, or the user explicitly requests React rules, also register the opt-in React plugin. Its rules encode React 19 deprecations from the official upgrade guide and the `@deprecated` tags in `@types/react`, so `FormEvent`, `propTypes`, `defaultProps` on function components, `forwardRef`, `string refs`, legacy context, and the removed `react-dom` entry points are all reported:

   ```ts
   jsPlugins: [
     {
       name: "anti-slop-react",
       specifier: "./tools/oxlint/anti-slop/react/index.ts",
     },
   ],
   rules: {
     "anti-slop-react/no-array-index-key": "error",
     "anti-slop-react/no-default-props-on-function-component": "error",
     "anti-slop-react/no-deprecated-event-property": "error",
     "anti-slop-react/no-deprecated-form-event": "error",
     "anti-slop-react/no-deprecated-jsx-attribute": "error",
     "anti-slop-react/no-deprecated-react-type": "error",
     "anti-slop-react/no-forward-ref": "error",
     "anti-slop-react/no-global-jsx-namespace": "error",
     "anti-slop-react/no-implicit-ref-callback-return": "error",
     "anti-slop-react/no-legacy-class-lifecycle": "error",
     "anti-slop-react/no-legacy-context": "error",
     "anti-slop-react/no-legacy-react-dom-api": "error",
     "anti-slop-react/no-nested-component": "error",
     "anti-slop-react/no-prop-types": "error",
     "anti-slop-react/no-react-internals": "error",
     "anti-slop-react/no-string-refs": "error",
     "anti-slop-react/no-use-reducer-type-argument": "error",
     "anti-slop-react/no-use-ref-without-argument": "error"
   },
   ```

   If the user asks to keep prose in comments free of AI writing patterns, also register the opt-in prose plugin:

   ```ts
   jsPlugins: [
     {
       name: "anti-slop-prose",
       specifier: "./tools/oxlint/anti-slop/prose/index.ts",
     },
   ],
   rules: {
     "anti-slop-prose/no-ai-vocabulary": "error",
     "anti-slop-prose/no-chatbot-residue": "error",
     "anti-slop-prose/no-changelog-comment": "error",
     "anti-slop-prose/no-comment-repeats-symbol-name": "error",
     "anti-slop-prose/no-copula-avoidance": "error",
     "anti-slop-prose/no-dash-as-connector": "error",
     "anti-slop-prose/no-decorative-formatting": "error",
     "anti-slop-prose/no-forced-triad": "error",
     "anti-slop-prose/no-hyphenated-pair": "error",
     "anti-slop-prose/no-inflated-significance": "error",
     "anti-slop-prose/no-knowledge-limit-disclaimer": "error",
     "anti-slop-prose/no-not-but-contrast": "error",
     "anti-slop-prose/no-one-line-closer": "error",
     "anti-slop-prose/no-passive-voice": "error",
     "anti-slop-prose/no-philosophical-saying": "error",
     "anti-slop-prose/no-repeated-sentence-opening": "error",
     "anti-slop-prose/no-sales-language": "error",
     "anti-slop-prose/no-shallow-ing-rider": "error",
     "anti-slop-prose/no-smart-quotes": "error",
     "anti-slop-prose/no-stacked-qualifier": "error",
     "anti-slop-prose/no-staged-runup": "error",
     "anti-slop-prose/no-unraised-objection": "error",
     "anti-slop-prose/no-vague-association": "error"
   },
   ```

   These rules read comments by default and string literals only when configured with `{ "includeStrings": true }`. They encode the Humanizer skill's patterns (MIT, from blader/humanizer, itself based on Wikipedia's "Signs of AI writing"). When the user dislikes a specific phrase, edit the labelled pattern list in the vendored `prose/rules/*.ts` file rather than disabling the rule, and prefer the rule's own options (`maxDashes`, `minDistinct`, `extra`) first.

   Complete when the generic rules and the eligible Effect, React, and prose rules are registered and existing configuration is preserved.

4. Run the repository's lint command and typecheck. For Vite+, run the repository's full `vp check` command after adding both lint and format ignores. If findings appear in owned project source, report them and fix them only when the user asked for migration/cleanup. Do not suppress rules, weaken rule severity, add unsafe casts, or mechanically launder types to make lint pass.

   When cleanup is authorized, apply `require-readable-spacing` with lint autofix, then run the repository's formatter and lint again. Confirm a second fix/format pass leaves files unchanged. Keep whitespace fixes separate from semantic edits, preserve documentation attachment and overload groups, and do not enable an entire competing formatting preset.

   Complete when checks have run, fix/format stability has been verified for authorized cleanup, and every failure is resolved or reported with its diagnostics.

5. Record provenance in `UPSTREAM.md` beside the vendored entry point: source repository, exact source commit or recoverable pristine snapshot when available, installed plugin paths, and intentional deviations. Verify that the revision identifies the actual copied assets; a package version or the current upstream HEAD alone is insufficient. If provenance cannot be established, record it as unknown rather than guessing.

   Review the final diff and report the installed path, source identity, dependency/configuration changes, and check results. Complete when the record and report describe the files actually installed and any remaining findings.
