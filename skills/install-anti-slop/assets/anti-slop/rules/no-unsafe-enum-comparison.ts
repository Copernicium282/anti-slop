import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

const comparisonOperators = new Set(["===", "!==", "==", "!=", ">", "<", ">=", "<="]);

/** `Direction.Up` reads a member off something that is not a known enum declaration. */
function enumMemberReference(node: ESTree.Node): string | null {
	if (node.type !== "MemberExpression" || node.computed) return null;
	if (node.property.type !== "Identifier") return null;
	return node.property.name;
}

/**
 * Disallow comparing an enum member with a primitive literal.
 *
 * A string enum and its literal have no overlap, so the comparison is never true at
 * runtime while it still type-checks. TypeScript 5.6 went further and started
 * erroring on some of these; comparing through the enum is always correct.
 */
export const noUnsafeEnumComparisonRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow comparing an enum member against a primitive literal, which can never be equal at runtime.",
		},
		messages: {
			unsafeEnumComparison:
				"Comparing an enum member with a `{{literal}}` literal is never true for a string enum and hides the mistake. Compare against the enum member, or parse the input into the enum before comparing.",
		},
	},
	createOnce(context) {
		return {
			BinaryExpression(node) {
				if (!comparisonOperators.has(node.operator)) return;
				const [left, right] = [node.left, node.right];
				const literal = left.type === "Literal" ? left : right;
				if (literal.type !== "Literal" || typeof literal.value !== "string") return;
				const other = left === literal ? right : left;
				if (enumMemberReference(other) === null) return;
				context.report({
					node,
					messageId: "unsafeEnumComparison",
					data: { literal: "string" },
				});
			},
		};
	},
});
