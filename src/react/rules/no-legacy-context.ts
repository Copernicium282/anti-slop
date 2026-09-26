import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** React 19 removed legacy context; `contextType` replaced it. */
const legacyContextMembers = new Map([
	["contextTypes", "read a context with `static contextType` and the context object itself"],
	["childContextTypes", "provide a context by rendering its provider component"],
	["getChildContext", "provide a context by rendering its provider component"],
]);

/** `static contextTypes = {}` and `Foo.contextTypes = {}`. */
function legacyContextKey(node: ESTree.Node): string | null {
	if (node.type === "MethodDefinition" || node.type === "PropertyDefinition") {
		if (node.computed || node.key.type !== "Identifier") return null;
		return legacyContextMembers.has(node.key.name) ? node.key.name : null;
	}
	if (node.type === "AssignmentExpression" && node.left.type === "MemberExpression") {
		if (node.left.computed || node.left.property.type !== "Identifier") return null;
		return legacyContextMembers.has(node.left.property.name) ? node.left.property.name : null;
	}
	if (node.type === "CallExpression") {
		const callee = node.callee;
		if (callee.type !== "MemberExpression" || callee.computed) return null;
		if (callee.property.type !== "Identifier") return null;
		return legacyContextMembers.has(callee.property.name) ? callee.property.name : null;
	}
	return null;
}

/** Disallow the legacy context API that React 19 removed. */
export const noLegacyContextRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow legacy context (`contextTypes`, `childContextTypes`, `getChildContext`), which React 19 removed because of subtle bugs.",
		},
		messages: {
			legacyContext:
				"React 19 removed `{{name}}`. Create a context with `createContext` and {{replacement}}.",
		},
	},
	createOnce(context) {
		const check = (node: ESTree.Node) => {
			const name = legacyContextKey(node);
			if (name === null) return;
			context.report({
				node,
				messageId: "legacyContext",
				data: { name, replacement: legacyContextMembers.get(name) ?? "use the context API" },
			});
		};

		return {
			MethodDefinition: check,
			PropertyDefinition: check,
			AssignmentExpression: check,
			CallExpression: check,
		};
	},
});
