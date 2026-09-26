# anti-slop

[![skills.sh](https://skills.sh/b/dmmulroy/anti-slop)](https://skills.sh/dmmulroy/anti-slop)

Opinionated Oxlint rules that reject low-evidence and low-signal TypeScript and JavaScript patterns.

Anti-slop is first and foremost the ruleset I use with my work, projects, and team. It reflects my preferences and taste rather than attempting to be a universal coding standard.

**This project is meant to be vendored**, not treated as a fixed npm dependency. There is no official npm package. Copy the rules into your repository, read them, and change them to match your team's standards. The bundled agent skill handles the initial copy and configuration; after that, the vendored files are yours to maintain and make your own. Community-maintained forks and packages are welcome, but their compatibility and release lifecycle belong to their maintainers.

## Install with an agent skill

```bash
npx skills add dmmulroy/anti-slop --skill install-anti-slop
```

Then ask your coding agent to install or configure anti-slop in the current repository. The skill copies the plugin, installs compatible Oxlint dependencies—matching an existing Oxlint version when present—merges the plugin into the existing lint configuration, enables every generic rule, and validates the result. In repositories that depend directly on Effect, it also enables the opt-in Effect rule group.

### Update an existing installation

Ask your agent to **update anti-slop while preserving local customizations**, optionally naming an upstream revision or selected fixes. The same skill stages incoming source separately, uses a three-way merge when the original upstream snapshot is recoverable, and otherwise ports reviewed changes conservatively. It preserves local rules and configuration, asks about conflicting policy and enabling new rules, and records provenance for future updates. It does not force-replace the vendored directory.

For latest upstream, ask the agent to retrieve and identify that revision; an already-installed skill bundle may be older. The copy script itself does not fetch or merge updates.

To inspect available skills first:

```bash
npx skills add dmmulroy/anti-slop --list
```

## Manual local installation

Copy `src/` into the target repository, for example at `tools/oxlint/anti-slop/`. If the repository already uses `oxlint`, install `@oxlint/plugins` at exactly the resolved Oxlint version. Otherwise, install the same current version of both packages. Keep both versions exact so upgrades move them together.

Register the copied entry point in `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
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
  rules: {
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
});
```

The same `ignorePatterns`, `jsPlugins`, and rules work under `lint` in a Vite+ config. Merge the ignore patterns into Vite+'s `fmt.ignorePatterns` as well so `vp check` does not reformat installed agent assets or the vendored plugin. Preserve existing ignores and add any other project-local agent tooling directories detected in the repository; do not broadly ignore every dot-directory.

### Optional Effect rules

Effect-specific rules live in a separate plugin so projects that do not use Effect do not inherit Effect architecture policy. Register the Effect entry point only in repositories that use Effect:

```ts
export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    {
      name: "anti-slop-effect",
      specifier: "./tools/oxlint/anti-slop/effect/index.ts"
    }
  ],
  rules: {
    "anti-slop-effect/no-manual-effect-error-tag": "error",
    "anti-slop-effect/no-manual-tag-comparison": "error",
    "anti-slop-effect/no-manual-tagged-construction": "error",
    "anti-slop-effect/no-service-constructor-imports": "error",
    "anti-slop-effect/prefer-effect-match": "error"
  }
});
```

### Optional React rules

The React group encodes React 19 deprecations from the official upgrade guide and the `@deprecated` tags in `@types/react`. Register it only in repositories that use React:

```ts
export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    { name: "anti-slop-react", specifier: "./tools/oxlint/anti-slop/react/index.ts" }
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
  }
});
```

### Optional prose rules

The prose group turns the Humanizer skill's writing patterns into deterministic checks over comments and documentation, so an agent cannot quietly fill a file with stock phrasing. It follows the source skill's own rule: the strongest patterns report on a single sighting, and the patterns the skill marks as *weak alone* only report when the same passage stacks several of them. Comments are the only surface by default; add `{ "includeStrings": true }` to also check user-facing string literals.

```ts
export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    { name: "anti-slop-prose", specifier: "./tools/oxlint/anti-slop/prose/index.ts" }
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
  }
});
```

The patterns come from [blader/humanizer](https://github.com/blader/humanizer) (MIT), which is itself built on Wikipedia's ["Signs of AI writing"](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). Because this project vendors the rules, edit the phrase lists in `src/prose/rules/*.ts` to match your own voice instead of forking: a phrase list is a plain array of labelled patterns.

## Rules

### Generic rules

- `no-array-filter-map` — rejects adjacent eager array filter/map passes while allowing lazy iterator pipelines.
- `no-async-promise-executor` - rejects an `async` function passed as a `Promise` executor, where a throw after the first `await` never rejects the promise.
- `no-empty-object-type` - rejects `{}`, which accepts every non-nullish value and therefore behaves like `any`. Dictionary value positions stay with `no-unsafe-dictionary-type`.
- `no-enum-declaration` - rejects `enum`, which needs a runtime object and cannot be erased by type stripping. TypeScript's "Objects vs Enums" page documents the `as const` alternative.
- `no-global-regex-replace` - rejects `String.prototype.replace` with a global regex in favor of `replaceAll` or `matchAll`.
- `no-import-assertions` - rejects `import ... asserts { ... }`; TypeScript 6.0 deprecated it, TypeScript 7.0 rejects it, and current parsers already fail to parse it.
- `no-json-clone-round-trip` - rejects `JSON.parse(JSON.stringify(value))` as a deep clone, which drops `Date`, `Map`, `Set`, functions, and cycles.
- `no-legacy-has-own-property` - rejects `Object.prototype.hasOwnProperty.call` and `value.hasOwnProperty` in favor of `Object.hasOwn`, which MDN documents as the replacement.
- `no-legacy-namespace-keyword` - rejects `module Foo {}`, deprecated in TypeScript 6.0 and rejected in TypeScript 7.0.
- `no-parameter-property` - rejects constructor parameter properties, which compile to assignments type stripping cannot erase.
- `no-reduce-grouping` - rejects hand-rolled grouping reducers in favor of `Object.groupBy` or `Map.groupBy`.
- `no-string-execution` - rejects `eval`, `new Function`, and string callbacks to `setTimeout`/`setInterval`.
- `no-unsafe-enum-comparison` - rejects comparing an enum member against a primitive literal, which can never be equal at runtime for a string enum.
- `no-unsupported-jsdoc-tag` - rejects `@enum` and `@constructor`, which TypeScript 7.0 no longer recognizes in JavaScript files.
- `no-wrapper-object-types` - rejects `String`, `Number`, `Boolean`, `Symbol`, `BigInt`, and `Object` as types, because they describe boxed objects.
- `no-reduce-accumulator-copy` — rejects non-spread accumulator copies inside reducers; complements native `oxc/no-accumulating-spread`.
- `no-chained-type-assertions` — rejects nested `as` and angle-bracket assertions that fabricate evidence; chains made only of `as const` remain valid.
- `no-conditional-empty-object-spread` — reports object spreads that use a conditional `{}` branch to omit fields. It intentionally has no autofix because omission is not equivalent to assigning `undefined`.
- `no-known-value-widening` — rejects known expressions flowing into explicit `unknown`, `object`, anonymous-object, or open-dictionary targets, including known arguments passed to local `unknown` type predicates. Empty dictionary accumulators and finite-key `Record` targets remain valid.
- `no-module-mocking` — rejects Vitest and Jest `mock`, `doMock`, and `unstable_mockModule` calls in favor of real dependency seams.
- `no-object-parameters` — rejects `object`, unions containing it, and scoped or transparent generic aliases that resolve to it on function inputs.
- `no-reflect-apply` — rejects global `Reflect.apply` in favor of typed function calls.
- `no-reflect-get` — rejects global `Reflect.get` in favor of typed property access or boundary parsing.
- `no-runtime-typeof` — requires boundary parsing instead of ad hoc `typeof` narrowing. Existence probes against the string `"undefined"` are allowed, and type predicates can be enabled explicitly.
- `no-shape-in-symbol-names` — rejects the case-insensitive substring `shape` in locally owned symbol names while allowing static member names such as Zod's `schema.shape` that cannot be renamed locally.
- `no-unknown-parameters` — rejects `unknown` and unions containing it on function inputs except the explicit `cause` convention and the exact subject of a type predicate.
- `no-unknown-returns` — rejects explicit function contracts that resolve to `unknown`, `Promise<unknown>`, or `PromiseLike<unknown>`, including scoped and transparent generic aliases.
- `no-unknown-type-aliases` — rejects scoped and transparent generic aliases whose resolved type is `unknown`.
- `no-unsafe-dictionary-type` — rejects dictionary value contracts based on `unknown`, `any`, `object`, `{}`, and semantic equivalents. Generic constraints such as `T extends Record<string, unknown>` are allowed.
- `no-widen-then-assert` — rejects immutable local flows that widen known evidence to `unknown`, `any`, `object`, or a broad record and later assert it back to a narrower type.
- `require-readable-spacing` — autofixes missing blank lines between top-level declarations, around multiline bindings, before control flow/returns, and after blocks; preserves compact local bindings, imports, and overload groups.
- `require-safety-comment-for-type-assertion` — requires each non-const assertion to have a nearby, non-empty invariant justification. Marker prefixes are configurable and default to `SAFETY`.

### React rules

- `no-array-index-key` - rejects `key={index}`, so state and DOM nodes follow a position instead of an item when the list reorders.
- `no-default-props-on-function-component` - rejects `defaultProps` on function components, which React 19 removed in favor of ES6 default parameters. Class components keep it.
- `no-deprecated-event-property` - rejects `keyCode`, `charCode`, and `which` read off a keyboard event, in a JSX handler or an `addEventListener` callback.
- `no-deprecated-form-event` - rejects `FormEvent` and `FormEventHandler`, which `@types/react` deprecates because no DOM event is a plain form event.
- `no-deprecated-jsx-attribute` - rejects `onKeyPress`, `aria-grabbed`, `aria-dropeffect`, `charSet`, `frameBorder`, `marginWidth`, and `marginHeight`.
- `no-deprecated-react-type` - rejects the rest of the deprecated type names (`MutableRefObject`, `LegacyRef`, `PropsWithRef`, `ReactFragment`, `SFC`, and friends), including `React.`-qualified uses.
- `no-forward-ref` - rejects `forwardRef`, since React 19 passes `ref` as an ordinary prop to function components.
- `no-global-jsx-namespace` - rejects `declare global { namespace JSX { ... } }`; React 19 requires augmentation through `declare module "react"`.
- `no-implicit-ref-callback-return` - rejects an implicit return from a ref callback, which React 19 reads as a cleanup function. Returning a cleanup function stays allowed.
- `no-legacy-class-lifecycle` - rejects `componentWillMount`, `componentWillReceiveProps`, and `componentWillUpdate`, including the `UNSAFE_` names.
- `no-legacy-context` - rejects `contextTypes`, `childContextTypes`, and `getChildContext`, which React 19 removed.
- `no-legacy-react-dom-api` - rejects `ReactDOM.render`, `ReactDOM.hydrate`, `unmountComponentAtNode`, `findDOMNode`, `createFactory`, `react-dom/test-utils`, and `react-test-renderer`.
- `no-nested-component` - rejects a component declared inside another component, which creates a new component type on every render.
- `no-prop-types` - rejects the `prop-types` package and `Component.propTypes`, which React 19 ignores.
- `no-react-internals` - rejects `__SECRET_INTERNALS_*`, `ReactSharedInternals`, and `ReactCurrentDispatcher`.
- `no-string-refs` - rejects `ref="input"` and `this.refs`, which React 19 removed.
- `no-use-reducer-type-argument` - rejects `useReducer<Reducer<State, Action>>(reducer)`, which React 19 no longer accepts as a single type argument.
- `no-use-ref-without-argument` - rejects `useRef()`, which React 19 requires an argument for.

### Prose rules

These rules read comments (and optionally string literals) rather than types. Each one names the Humanizer pattern it encodes, so a finding points at a specific writing habit instead of a vague tone complaint.

- `no-ai-vocabulary` - two or more stock AI words (`delve`, `tapestry`, `testament`, `pivotal`, ...) in one passage. Extend the list with `{ "extra": ["seamless"] }`.
- `no-chatbot-residue` - rejects `I hope this helps`, `Great question!`, `let me know`, and other wrappers that belong in a chat rather than a file.
- `no-changelog-comment` - rejects a comment that describes what the code replaced instead of what it does.
- `no-comment-repeats-symbol-name` - rejects a doc comment whose first sentence restates the symbol's own name.
- `no-copula-avoidance` - rejects `serves as`, `functions as`, `refers to`, and similar phrases standing in for `is`, `are`, or `has`.
- `no-dash-as-connector` - rejects em dashes, en dashes, and spaced `--` used to join clauses. `{ "maxDashes": 1 }` sets a budget for a house style.
- `no-decorative-formatting` - rejects a bold label, a bold line, and emoji applied as decoration.
- `no-forced-triad` - rejects a three-item list of equal weight padded to three.
- `no-hyphenated-pair` - rejects repeated hyphenated pairs (`cross-functional`, `high-quality`, ...) with `{ "minDistinct": 3 }` by default.
- `no-inflated-significance` - rejects `stands as a testament`, `a pivotal moment`, `the future looks bright`, and similar dressing.
- `no-knowledge-limit-disclaimer` - rejects `not publicly available`, `it is believed that`, and other guesses presented as sourced.
- `no-not-but-contrast` - rejects `not just X, it's Y`, including the form split across two sentences.
- `no-one-line-closer` - rejects a stock punchline, a short demonstrative closer, and a row of fragments.
- `no-passive-voice` - rejects a passive clause that hides the actor. `{ "minOccurrences": 2 }` follows the source skill's *weak alone* note.
- `no-philosophical-saying` - rejects `at its core`, `the real question is`, and `X is the language of Y`.
- `no-repeated-sentence-opening` - rejects three or more consecutive sentences opening with the same word.
- `no-sales-language` - rejects `nestled`, `breathtaking`, `renowned`, `boasts`, and, in pairs, `rich`/`featuring`/`profound`.
- `no-shallow-ing-rider` - rejects a trailing `-ing` rider (`symbolizing`, `showcasing`) with no claim of its own.
- `no-smart-quotes` - rejects curly quotes. It reads strings by default because that is where they appear.
- `no-stacked-qualifier` - rejects two or more stacked qualifiers in one passage.
- `no-staged-runup` - rejects `let's dive in`, `here's what you need to know`, and other staged openers.
- `no-unraised-objection` - rejects `this isn't mainly about`, `to be clear`, and arguments with no one.
- `no-vague-association` - rejects `associated with` and `linked to` where the source does not name the relationship.
### Effect rules

- `no-manual-effect-error-tag` — rejects manual `_tag` comparisons and switches inside broad `Effect.catch`, `Effect.catchAll`, and `Effect.catchIf` handlers in favor of tagged error handlers.
- `no-manual-tag-comparison` — rejects direct `_tag` comparisons and `_tag` switches in favor of `Match`, `Predicate.isTagged`, or tagged-enum matching.
- `no-manual-tagged-construction` — rejects literal `_tag` object construction in favor of Schema, tagged class/error, or `Data.taggedEnum` constructors. `Match.when` and `Match.not` patterns remain allowed.
- `no-service-constructor-imports` — rejects named `make<CapabilityName>` imports from relative project modules outside `*.test.*` and `*.spec.*` files. Runtime callers should import the owning Layer and yield the contextual service instead. Package and path-alias imports, default imports, and static constructors such as `WorkspaceName.make` are outside the rule.
- `prefer-effect-match` — rejects chained literal ternaries over the same value in favor of Effect's `Match` API.

### Violation examples for the new rules

``	s
// no-empty-object-type
function save(value: {}) {}

// no-wrapper-object-types
function label(value: String) {}

// no-enum-declaration
enum Direction { Up, Down }

// no-parameter-property
class Point { constructor(public id: string) {} }

// no-legacy-namespace-keyword
module Models { export const version = 1; }

// no-import-assertions
import data from "./data.json" asserts { type: "json" };

// no-string-execution
const value = eval("1 + 1");

// no-legacy-has-own-property
const hasId = Object.prototype.hasOwnProperty.call(record, "id");

// no-global-regex-replace
const slug = title.replace(/[^a-z]+/g, "-");

// no-async-promise-executor
const ready = new Promise(async resolve => { resolve(await load()); });

// no-json-clone-round-trip
const copy = JSON.parse(JSON.stringify(value));

// no-reduce-grouping
const byOwner = rows.reduce((groups, row) => { /* ... */ return groups; }, new Map());

// no-unsafe-enum-comparison
const isReady = Status.Ready === "ready";
``

``	sx
// React: no-deprecated-form-event
function onSubmit(event: React.FormEvent<HTMLFormElement>) {}

// React: no-legacy-react-dom-api
import { render } from "react-dom";

// React: no-array-index-key
rows.map((row, index) => <Row key={index} row={row} />);

// React: no-nested-component
function Table() { const Row = () => <tr />; return <Row />; }

// React: no-forward-ref
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} />);
``

``	s
// Prose: no-not-but-contrast
// It's not just a cache; it's the source of truth.

// Prose: no-ai-vocabulary
// A delve into the intricate tapestry of the retry policy.

// Prose: no-dash-as-connector
// The new policy � announced without warning � affects thousands of workers.

// Prose: no-chatbot-residue
// I hope this helps! Let me know if you need more.
``
### Analysis boundaries

The rules use Oxlint's ESTree and lexical-scope APIs rather than a TypeScript type checker. Global checks (`JSON`, `Object`, `eval`) resolve a name through the scope chain and require no local binding, so a shadowed local stays valid. Module checks in the React group look at the import, so `import { render } from "somewhere-else"` is not mistaken for `react-dom`. Prose rules match comment and string text; they do not parse Markdown files, and a passage is one comment or one string literal.
The rules use Oxlint's ESTree and lexical-scope APIs rather than a TypeScript type checker. They resolve same-file aliases—including block-scoped aliases, forward references, and transparent generic aliases—but do not infer imported type definitions or cross-file call signatures. Rules that inspect calls therefore document when enforcement is intentionally local.

## Violation examples

Each snippet below is rejected by the named rule.

### `no-array-filter-map`

```ts
const users: User[] = loadUsers();
const emails = users.filter(user => user.active).map(user => user.email);
const found = users.map(lookup).filter(value => value !== undefined);
```

Prefer lazy iterator helpers where the target runtime supports them:

```ts
const emails = users.values()
  .filter(user => user.active)
  .map(user => user.email)
  .toArray();
```

A single `flatMap(user => user.active ? [user.email] : [])` or a reducer that pushes into a fresh local array is also allowed. Iterator helpers avoid intermediate arrays and per-item wrapper arrays, but are not guaranteed to be faster. Check runtime support; TypeScript library declarations do not polyfill them.

This AST/scope rule recognizes array literals, direct array/tuple annotations, immutable local aliases, and supported array-preserving method chains. Unknown receivers (including imported factory results and unannotated parameters), type aliases, and property-based array types are not inferred. Iterator pipelines are not flagged. Both `filter().map()` and `map().filter()` are covered, regardless of predicate. There is no autofix: callback ordering, indexes, `thisArg`, sparse arrays, and truthiness filtering must be reviewed before changing APIs.

### `no-reduce-accumulator-copy`

```ts
items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {});
items.reduce((acc, item) => acc.concat([item]), []);
items.reduce((acc, item) => {
  const next = acc.slice();
  next.push(item);
  return next;
}, []);
```

Instead, mutate a fresh, locally owned accumulator and return it:

```ts
items.reduce((acc, item) => {
  acc.push(item);
  return acc;
}, []);
```

`Object.assign(acc, item)` is also allowed. Copying individual input items is not copying accumulated state.

The rule covers inline `reduce`/`reduceRight` callbacks, including index parameters, and immutable local accumulator aliases. It detects global `Object.assign` with an object-literal target and the accumulator as a source, global `Array.from(acc)`, and array accumulator calls to `concat`, `slice`, `toSpliced`, `toSorted`, `toReversed`, and `with`. Array copy methods require local array evidence for the initial value so string concatenation and unknown custom collections are not flagged. Like the native rule, reducer method names are syntactic evidence, not proof of the receiver's runtime type. Named callbacks, nested functions, indirect copy helpers, nested accumulator properties, and reassigned aliases are outside its scope. Copying a bounded accumulator is not necessarily quadratic, but these patterns are rejected because growing accumulators can be.

Enable native `oxc/no-accumulating-spread` alongside it for array/object spreads in reducers and supported loops. Neither rule proves that every possible quadratic reduction is absent. No automatic mutation rewrite is provided because accumulator ownership cannot be established syntactically.

### `no-chained-type-assertions`

```ts
const user = input as object as User;
```

### `no-conditional-empty-object-spread`

```ts
const options = {
  ...(timeout !== undefined ? { timeout } : {}),
};
```

### `no-known-value-widening`

```ts
const handlers: Record<string, Handler> = {
  start: startHandler,
};
```

This discards the known `start` key. Preserve inference or use `satisfies Record<string, Handler>` instead.

Known values must not be widened back to `unknown` through a local type predicate:

```ts
function isUser(value: unknown): value is User {
  return UserSchema.safeParse(value).success;
}

declare const user: User;
isUser(user);
```

Call the predicate at the unparsed boundary, while the argument is still `unknown`.

### `no-module-mocking`

```ts
vi.mock("./user-store");
```

### `no-object-parameters`

```ts
function save(value: object) {}
```

### `no-reflect-apply`

```ts
const value = Reflect.apply(operation, owner, args);
```

### `no-reflect-get`

```ts
const value = Reflect.get(owner, key);
```

### `no-runtime-typeof`

```ts
if (typeof input === "string") {
  useName(input);
}
```

Schema-free projects can permit `typeof` checks directly inside type predicate and
assertion functions while continuing to reject ad hoc checks elsewhere:

```json
{
  "anti-slop/no-runtime-typeof": [
    "error",
    { "allowInTypeGuards": true }
  ]
}
```

The option defaults to `false`. Existence probes such as `typeof document === "undefined"` are always allowed because they establish whether a binding exists rather than narrow its representation.

### `no-shape-in-symbol-names`

```ts
interface UserShape {
  id: string;
}
```

Static member reads such as `schema.shape` are allowed because the member name belongs to the value's owner and cannot be renamed locally.

### Effect: `no-service-constructor-imports`

```ts
import { makeIssueService } from "./issue-service.ts";
```

Import the owning Layer and yield `IssueService` instead. Focused `*.test.*` and `*.spec.*` files may import the constructor directly.

### Effect: tagged values and matching

Direct tag checks are rejected by `no-manual-tag-comparison`:

```ts
if (result._tag === "Ready") useReady(result);
```

Use `Predicate.isTagged` for a predicate or `Match` for branching:

```ts
if (Predicate.isTagged("Ready")(result)) useReady(result);
```

Literal tag objects are rejected by `no-manual-tagged-construction`:

```ts
const result = { _tag: "Ready", value };
```

Use the existing Schema, tagged class/error, or `Data.taggedEnum` constructor instead, such as `Ready.make({ value })`. Object patterns passed directly to `Match.when` and `Match.not` remain allowed.

Manual tag branching in broad catch handlers is rejected by `no-manual-effect-error-tag`:

```ts
program.pipe(
  Effect.catch((error) =>
    error._tag === "NotFound" ? recover : Effect.fail(error)
  )
);
```

Use the selective error operator:

```ts
program.pipe(Effect.catchTag("NotFound", () => recover));
```

For a tagged `error.reason`, use `Effect.catchReason` or `Effect.catchReasons`.

Repeated literal ternaries over the same value are rejected by `prefer-effect-match`:

```ts
const label = kind === "a" ? "A" : kind === "b" ? "B" : "Other";
```

Use `Match`:

```ts
const label = Match.value(kind).pipe(
  Match.when("a", () => "A"),
  Match.when("b", () => "B"),
  Match.orElse(() => "Other")
);
```

These rules are syntactic. They recognize direct `Effect.catch*` and `Match.when`/`Match.not` calls under those exact identifiers and do not resolve import aliases or verify that similarly named objects came from Effect. `prefer-effect-match` compares the source text of the repeatedly tested expression; it does not infer its type or prove exhaustiveness.

### `no-unknown-parameters`

```ts
function handle(input: unknown) {}
```

A type predicate may accept `unknown` for the parameter it narrows; other `unknown`
parameters on the same function remain rejected.

### `no-unknown-returns`

```ts
function loadUser(): unknown {
  return input;
}
```

### `no-unknown-type-aliases`

```ts
type ExternalValue = unknown;
```

### `no-unsafe-dictionary-type`

```ts
type Metadata = Record<string, unknown>;
type OtherMetadata = { [key: string]: object };
```

### `no-widen-then-assert`

```ts
const loaded: User = loadUser();
const stored: unknown = loaded;
const user = stored as User;
```

### `require-readable-spacing`

```ts
export const first = 1;
/** Documentation stays attached to second. */
export const second = 2;
```

Autofix inserts a blank line before the documentation. Inside functions, adjacent short variable declarations stay grouped, while multiline bindings and control-flow boundaries receive spacing. Adjacent function overload signatures and their implementation remain grouped. Existing blank lines are never removed. The rule takes no options; edit the vendored policy if your team's preferences differ.

Run `oxlint --fix` (or `vp lint --fix`), then your formatter, then lint again. The rule inserts whitespace only; it does not add braces, wrap expressions, sort imports, or infer every logical group. Keep indentation and wrapping with the formatter rather than enabling a competing stylistic preset.

The comment-aware engine is [vendored from ESLint Stylistic](src/vendor/eslint-stylistic/UPSTREAM.md) under MIT. Copy its `LICENSE` and provenance along with the code; no third-party plugin dependency is needed.

### `require-safety-comment-for-type-assertion`

```ts
const userId = value as UserId;
```

Add a specific justification immediately before a necessary assertion:

```ts
// SAFETY: parseUserId validated the identifier before branding it.
const userId = value as UserId;
```

`SAFETY` remains the default marker. Comments immediately above exported declarations are recognized. Repositories with an established convention can configure one or more alternatives; every marker must still be followed by a colon and a non-empty justification:

```json
{
  "anti-slop/require-safety-comment-for-type-assertion": [
    "error",
    { "markers": ["INVARIANT", "SAFETY"] }
  ]
}
```

## Development

```bash
pnpm install
pnpm check
```

`src/` is canonical. After changing production source, run `pnpm sync:skill-assets`; CI checks that the skill's bundled copy remains identical. `pnpm check` runs Oxlint, every RuleTester suite, TypeScript typechecking, and the skill-asset drift check.

## License

MIT
