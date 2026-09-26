import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** Class lifecycles React deprecated, including the `UNSAFE_` opt-in names. */
const legacyLifecycles = new Set([
	"componentWillMount",
	"componentWillReceiveProps",
	"componentWillUpdate",
	"UNSAFE_componentWillMount",
	"UNSAFE_componentWillReceiveProps",
	"UNSAFE_componentWillUpdate",
]);

/** Replacement for each removed lifecycle, used in the diagnostic. */
const replacements = new Map([
	["componentWillMount", "move the work into the constructor or `componentDidMount`"],
	["UNSAFE_componentWillMount", "move the work into the constructor or `componentDidMount`"],
	["componentWillReceiveProps", "derive the value during render or in `getDerivedStateFromProps`"],
	["UNSAFE_componentWillReceiveProps", "derive the value during render or in `getDerivedStateFromProps`"],
	["componentWillUpdate", "use `getSnapshotBeforeUpdate` or move the work into an effect"],
	["UNSAFE_componentWillUpdate", "use `getSnapshotBeforeUpdate` or move the work into an effect"],
]);

/** Disallow the pre-16.3 class lifecycles. */
export const noLegacyClassLifecycleRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the deprecated class lifecycles `componentWillMount`, `componentWillReceiveProps`, and `componentWillUpdate`, including their `UNSAFE_` names.",
		},
		messages: {
			legacyLifecycle:
				"`{{name}}` is a deprecated class lifecycle. {{replacement}}; prefer a function component with an effect when the state is local.",
		},
	},
	createOnce(context) {
		const check = (node: ESTree.MethodDefinition | ESTree.PropertyDefinition) => {
			if (node.computed || node.key.type !== "Identifier") return;
			const name = node.key.name;
			if (!legacyLifecycles.has(name)) return;
			context.report({
				node,
				messageId: "legacyLifecycle",
				data: { name, replacement: replacements.get(name) ?? "use a modern lifecycle" },
			});
		};

		return { MethodDefinition: check, PropertyDefinition: check };
	},
});
