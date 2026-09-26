import { defineRule } from "@oxlint/plugins";

import type { Rule } from "@oxlint/plugins";

/**
 * Disallow constructor parameter properties.
 *
 * `constructor(public id: string)` compiles to an assignment the type stripper cannot
 * see, so it is rejected under `--erasableSyntaxOnly` and by Node's type stripping.
 */
export const noParameterPropertyRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow TypeScript parameter properties; they compile to constructor assignments that type stripping cannot erase.",
		},
		messages: {
			parameterProperty:
				"A parameter property compiles to a constructor assignment, which type stripping cannot erase. Declare the field explicitly and assign it in the constructor body, or pass options through a plain parameter object.",
		},
	},
	createOnce(context) {
		return {
			TSParameterProperty(node) {
				context.report({ node, messageId: "parameterProperty" });
			},
		};
	},
});
