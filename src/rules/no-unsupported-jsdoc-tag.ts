import { defineRule } from "@oxlint/plugins";

import type { Rule } from "@oxlint/plugins";

/**
 * JSDoc tags TypeScript no longer recognizes.
 *
 * The TypeScript 7.0 JavaScript support was rewritten and stopped recognizing these
 * tags, so a JavaScript file that relies on them silently loses its types.
 */
const unsupportedTags = new Map([
	["@constructor", "type the class with a `@typedef` or a TypeScript `class` instead"],
	["@enum", "use a `@typedef` of string literals with a companion frozen object"],
]);

const tagPattern = /^[ \t]*(?:\*[ \t]?)?@([\p{L}][\p{L}\p{N}]*)/gmu;

/** Disallow JSDoc tags TypeScript 7 no longer recognizes. */
export const noUnsupportedJsdocTagRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the JSDoc tags `@enum` and `@constructor`, which TypeScript 7.0 no longer recognizes in JavaScript files.",
		},
		messages: {
			unsupportedJsdocTag:
				"TypeScript 7.0 no longer recognizes `{{tag}}`, so the annotation is ignored. {{replacement}}.",
		},
	},
	createOnce(context) {
		return {
			Program() {
				for (const comment of context.sourceCode.getAllComments()) {
					// Only JSDoc blocks annotate JavaScript; a line comment that mentions a
					// tag in prose is not an annotation.
					if (comment.type !== "Block" || !comment.value.startsWith("*")) continue;
					for (const match of comment.value.matchAll(tagPattern)) {
						const tag = match[1];
						if (tag === undefined) continue;
						const replacement = unsupportedTags.get(`@${tag.toLowerCase()}`);
						if (replacement === undefined) continue;
						const start = comment.start + 2 + (match.index ?? 0);
						context.report({
							loc: {
								start: context.sourceCode.getLocFromIndex(start),
								end: context.sourceCode.getLocFromIndex(start + match[0].length),
							},
							messageId: "unsupportedJsdocTag",
							data: { tag: `@${tag}`, replacement },
						});
					}
				}
			},
		};
	},
});
