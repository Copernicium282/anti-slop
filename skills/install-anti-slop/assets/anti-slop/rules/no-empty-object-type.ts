import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** A `{}` used as a dictionary value is the dictionary rule's business, not this one's. */
function isDictionaryValue(node: ESTree.TSTypeLiteral): boolean {
	const parent = node.parent;
	// An index signature's value is a dictionary value, whatever the wrapper type.
	if (parent.type === "TSIndexSignature") return true;
	if (parent.type === "TSTypeReference" && parent.typeName.type === "Identifier") {
		return parent.typeName.name === "Record";
	}
	return false;
}

/**
 * Disallow the `{}` type.
 *
 * `{}` accepts any non-nullish value, so it silently behaves like `any` for property
 * access. TypeScript's guidance is to use `unknown` at a boundary and a real shape
 * elsewhere.
 */
export const noEmptyObjectTypeRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the `{}` type, which accepts any non-nullish value and therefore behaves like `any`.",
		},
		messages: {
			emptyObjectType:
				"`{}` accepts every non-nullish value, so it disables checking without saying so. Use `unknown` for input you have not parsed yet, or spell out the properties the caller may rely on.",
		},
	},
	createOnce(context) {
		return {
			TSTypeLiteral(node) {
				if (node.members.length > 0 || isDictionaryValue(node)) return;
				context.report({ node, messageId: "emptyObjectType" });
			},
		};
	},
});
