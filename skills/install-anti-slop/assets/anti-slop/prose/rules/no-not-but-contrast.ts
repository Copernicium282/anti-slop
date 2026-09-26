import { defineRule } from "@oxlint/plugins";

import { proseVisitors } from "../shared/prose-rule.ts";
import { splitSentences } from "../shared/sentences.ts";

import type { Rule } from "@oxlint/plugins";

/** "not just X", "not merely X", "not simply X". */
const notJust = /\bnot\s+(?:just|merely|simply)\b/iu;

/** "It's not X, it's Y" and "this is not X, it is Y". */
const notBut = /\b\w+\s+is\s+not\s+[^.;!?]{1,60}[,;]\s*\w+\s+(?:is|are)\b/iu;

/** "This does not mean X. It means Y." */
const splitContrastLead =
	/\b(?:this|that|it)\s+(?:does\s+not|do\s+not|doesn'?t|don'?t|is\s+not|isn'?t)\s+(?:mean|about|imply|focus|concern|change)\b/iu;

/** The positive half of a contrast split across two sentences. */
const splitContrastFollow =
	/^(?:it|this|that)\s+(?:means|is\s+about|is\s+that|really\s+means)\b|^what\s+(?:really\s+)?matters\s+is\b/iu;

function hasSplitContrast(raw: string): boolean {
	const sentences = splitSentences(raw);
	return sentences.some((sentence, index) => {
		if (!splitContrastLead.test(sentence)) return false;
		return splitContrastFollow.test(sentences[index + 1] ?? "");
	});
}

/**
 * Reject the "not X, but Y" contrast, in one sentence or split across two.
 *
 * The negative half names a claim nobody made, so the positive half only sounds bigger.
 */
export const noNotButContrastRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the `not X, but Y` contrast in comments and documentation, including the form split across two sentences.",
		},
		messages: {
			notButContrast:
				"This `not X, but Y` contrast adds weight without adding a claim. State the point directly; keep a contrast only when the negative half corrects a belief the reader actually holds.",
		},
		schema: [
			{
				type: "object",
				properties: { includeStrings: { type: "boolean" } },
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false }],
	},
	createOnce(context) {
		return proseVisitors(context, "notButContrast", (segment, report) => {
			if (notJust.test(segment.raw) || notBut.test(segment.raw) || hasSplitContrast(segment.raw)) {
				report();
			}
		});
	},
});
