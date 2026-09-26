import { defineRule } from "@oxlint/plugins";

import { proseCountOption } from "../shared/segments.ts";
import { proseVisitors } from "../shared/prose-rule.ts";
import { coordinationItems, splitSentences, wordCount } from "../shared/sentences.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §6: ideas arrive in threes whether or not the meaning needs three parts. */

/** A leading clause may carry the subject and verb; the list items may not. */
const maxLeadWords = 8;

/**
 * A triad reads as a triad when the list items are the same size. The first item may
 * carry a leading clause, which is why only the trailing items are compared.
 */
function isForcedTriad(sentence: string, maxItemWords: number): boolean {
	const items = coordinationItems(sentence);
	if (items === null || items.length !== 3) return false;
	const [lead, ...list] = items as [string, ...string[]];
	if (wordCount(lead) > maxLeadWords) return false;
	if (!list.every((item) => wordCount(item) > 0 && wordCount(item) <= maxItemWords)) return false;
	const lengths = list.map((item) => wordCount(item));
	return Math.max(...lengths) - Math.min(...lengths) <= 1;
}

/** Disallow three-item coordinations that pad a list to reach three. */
export const noForcedTriadRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow three-item coordinations of equal weight (`keynote sessions, panel discussions, and networking opportunities`) in comments and documentation.",
		},
		messages: {
			forcedTriad:
				"This three-item list ({{sentence}}) reads as a rhythm rather than a fact. Keep the number of items the meaning needs and merge the rest.",
		},
		schema: [
			{
				type: "object",
				properties: {
					includeStrings: { type: "boolean" },
					maxItemWords: { type: "integer", minimum: 1 },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false, maxItemWords: 4 }],
	},
	createOnce(context) {
		return proseVisitors(context, "forcedTriad", (segment, report) => {
			const maxItemWords = proseCountOption(context, "maxItemWords", 4);
			for (const sentence of splitSentences(segment.raw)) {
				if (isForcedTriad(sentence, maxItemWords)) report(undefined, { sentence });
			}
		});
	},
});
