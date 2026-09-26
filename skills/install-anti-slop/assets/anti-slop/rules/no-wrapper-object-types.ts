import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/**
 * Wrapper object types, with the primitive they should be written as.
 *
 * `Number`, `String`, `Boolean`, `Symbol`, and `BigInt` describe boxed objects, so
 * `String` accepts a `String` object that most code never produces.
 */
const wrappers = new Map([
	["Boolean", "boolean"],
	["BigInt", "bigint"],
	["Number", "number"],
	["Object", "an object shape or `unknown`"],
	["String", "string"],
	["Symbol", "symbol"],
]);

/** `Set<string>[]` is fine; only a bare wrapper reference in type position is rejected. */
function wrapperName(node: ESTree.TSTypeReference): string | null {
	if (node.typeName.type !== "Identifier") return null;
	const name = node.typeName.name;
	return wrappers.has(name) ? name : null;
}

/** Disallow the boxed wrapper object types in type position. */
export const noWrapperObjectTypesRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `String`, `Number`, `Boolean`, `Symbol`, `BigInt`, and `Object` as types; use the primitive or a real shape.",
		},
		messages: {
			wrapperObjectType:
				"`{{name}}` is the boxed object type, so it accepts values that no primitive ever produces and rejects the primitive itself. Use `{{primitive}}`.",
		},
	},
	createOnce(context) {
		return {
			TSTypeReference(node) {
				const name = wrapperName(node);
				if (name === null) return;
				context.report({
					node,
					messageId: "wrapperObjectType",
					data: { name, primitive: wrappers.get(name) ?? "the primitive type" },
				});
			},
		};
	},
});
