import { defineRule } from "@oxlint/plugins";

import type { Rule } from "@oxlint/plugins";

/**
 * Disallow `enum` declarations.
 *
 * An enum is a runtime object the compiler has to emit, so it cannot be erased; a union
 * of literals with a companion object is erasable and tree-shakes. TypeScript's
 * "Objects vs Enums" page documents the trade-off, and `--erasableSyntaxOnly` bans
 * enums outright.
 */
export const noEnumDeclarationRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `enum` declarations in favour of a union of literals with a companion object, which erasable type stripping supports.",
		},
		messages: {
			enumDeclaration:
				"An `enum` needs a runtime object, so it cannot be erased by type stripping and blocks `--erasableSyntaxOnly`. Use a union of literals with a companion `as const` object when you also need a value map.",
		},
	},
	createOnce(context) {
		return {
			TSEnumDeclaration(node) {
				context.report({ node, messageId: "enumDeclaration" });
			},
		};
	},
});
