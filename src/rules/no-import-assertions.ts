import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** `asserts { type: "json" }` is the replaced import-assertion syntax. */
function isAssertsAttribute(node: ESTree.ImportAttribute): boolean {
	const key = node.key;
	// The AST types a quoted attribute key as a string literal.
	return key.type === "Identifier"
		? key.name === "asserts"
		: "value" in key && key.value === "asserts";
}

/**
 * Disallow import assertions.
 *
 * The assertion proposal became import attributes, so TypeScript 6.0 deprecated
 * `asserts` and TypeScript 7.0 errors on it.
 */
export const noImportAssertionsRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `import ... asserts { ... }`; TypeScript 6.0 deprecated it and TypeScript 7.0 rejects it in favour of import attributes.",
		},
		messages: {
			importAssertions:
				"Import assertions were replaced by import attributes. Write `import data from \"./data.json\" with { type: \"json\" }`; current parsers reject the `asserts` keyword outright, so this spelling also fails to build.",
		},
	},
	createOnce(context) {
		return {
			ImportAttribute(node) {
				if (isAssertsAttribute(node)) {
					context.report({ node, messageId: "importAssertions" });
				}
			},
		};
	},
});
