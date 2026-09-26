import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** A regex literal, which the AST types as a `Literal` carrying a `regex` field. */
function globalRegex(node: ESTree.Node): ESTree.RegExpLiteral | null {
	if (node.type !== "Literal" || !("regex" in node) || node.regex === undefined) return null;
	return node.regex.flags.includes("g") ? (node as ESTree.RegExpLiteral) : null;
}

/** `.replace(/needle/g, ...)` is `.replaceAll("needle", ...)` without the regex risk. */
function globalRegexReplacement(node: ESTree.CallExpression): ESTree.RegExpLiteral | null {
	const callee = node.callee;
	if (callee.type !== "MemberExpression" || callee.computed) return null;
	if (callee.property.type !== "Identifier" || callee.property.name !== "replace") return null;
	const [pattern] = node.arguments;
	return pattern === undefined ? null : globalRegex(pattern);
}

/** Disallow global regexes used with `String.prototype.replace`. */
export const noGlobalRegexReplaceRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `String.prototype.replace` with a global regex in favor of `String.prototype.replaceAll`.",
		},
		messages: {
			globalRegexReplace:
				"`replace` with a global regex stops at the first match unless the caller loops over `matchAll`, and the pattern is easy to misread. Use `replaceAll` with a string needle, or `matchAll` when every match is needed.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				const pattern = globalRegexReplacement(node);
				if (pattern === null) return;
				context.report({ node: pattern, messageId: "globalRegexReplace" });
			},
		};
	},
});
