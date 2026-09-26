import { defineRule } from "@oxlint/plugins";

import { proseCountOption } from "../shared/segments.ts";
import { proseVisitors } from "../shared/prose-rule.ts";
import { splitSentences } from "../shared/sentences.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §11: the text hides who acts. */
const passiveVerb =
	/\b(?:am|is|are|was|were|be|been|being|get|gets|got)\s+(?:\w+ed|built|made|done|known|given|taken|shown|found|seen|held|set|put|left|read|written|drawn|spoken|chosen|driven|kept|brought|thought)\b/iu;

/**
 * A passive clause with an explicit subject is a choice; one without a subject
 * reads as a fact nobody chose.
 */
const agentlessPassive =
	/\b(?:^|[.!?]\s+)(?:no|none|it|this|that|there)\s+(?:\w+\s+){0,2}(?:\w+ed|built|made|done|known|given|taken|required|needed|supported|preserved|automatically)\b/iu;

function passiveCount(raw: string, minimum: number): number {
	let count = 0;
	for (const sentence of splitSentences(raw)) {
		if (passiveVerb.test(sentence) || agentlessPassive.test(sentence)) count += 1;
		if (count >= minimum) return count;
	}
	return count;
}

/** Disallow passive constructions that hide the actor in comments and documentation. */
export const noPassiveVoiceRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow passive constructions that hide who acts in comments and documentation.",
		},
		messages: {
			passiveVoice:
				"This clause ({{sentence}}) hides the actor. Name who acts when it makes the sentence clearer; keep the passive where the actor does not matter.",
		},
		schema: [
			{
				type: "object",
				properties: {
					includeStrings: { type: "boolean" },
					minOccurrences: { type: "integer", minimum: 1 },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false, minOccurrences: 1 }],
	},
	createOnce(context) {
		return proseVisitors(context, "passiveVoice", (segment, report) => {
			const minimum = proseCountOption(context, "minOccurrences", 1);
			if (passiveCount(segment.raw, minimum) < minimum) return;
			for (const sentence of splitSentences(segment.raw)) {
				if (passiveVerb.test(sentence) || agentlessPassive.test(sentence)) {
					report(undefined, { sentence });
				}
			}
		});
	},
});
