import { defineRule } from "@oxlint/plugins";

import { isUnshadowedGlobal } from "../shared/scope.ts";

import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

/** `JSON.parse(JSON.stringify(value))` is the hand-rolled deep clone. */
function jsonCloneRoundTrip(node: ESTree.CallExpression, sourceCode: SourceCode): boolean {
	const callee = node.callee;
	if (callee.type !== "MemberExpression" || callee.computed) return false;
	if (callee.property.type !== "Identifier" || callee.property.name !== "parse") return false;
	if (callee.object.type !== "Identifier" || callee.object.name !== "JSON") return false;
	if (!isUnshadowedGlobal(sourceCode, callee.object)) return false;
	const [argument] = node.arguments;
	if (argument === undefined || argument.type !== "CallExpression") return false;
	const inner = argument.callee;
	if (inner.type !== "MemberExpression" || inner.computed) return false;
	if (inner.property.type !== "Identifier" || inner.property.name !== "stringify") return false;
	if (inner.object.type !== "Identifier" || inner.object.name !== "JSON") return false;
	return isUnshadowedGlobal(sourceCode, inner.object);
}

/**
 * Disallow the `JSON.parse(JSON.stringify(...))` deep clone.
 *
 * The round trip drops `undefined`, functions, `Date`, `Map`, `Set`, `RegExp`, symbols,
 * and cycles, and it turns a `BigInt` into a `RangeError`.
 */
export const noJsonCloneRoundTripRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the `JSON.parse(JSON.stringify(value))` deep clone in favor of `structuredClone` or an explicit copy.",
		},
		messages: {
			jsonCloneRoundTrip:
				"A JSON round trip is not a deep clone: it drops `undefined`, `Date`, `Map`, `Set`, and functions, and it throws on cycles and `BigInt`. Use `structuredClone(value)` when the platform has it, or write the copy the caller actually needs.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				if (jsonCloneRoundTrip(node, context.sourceCode)) {
					context.report({ node, messageId: "jsonCloneRoundTrip" });
				}
			},
		};
	},
});
