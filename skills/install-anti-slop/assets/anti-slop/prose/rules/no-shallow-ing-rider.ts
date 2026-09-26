import { defineRule } from "@oxlint/plugins";

import { proseVisitors } from "../shared/prose-rule.ts";
import { splitSentences, trailingClause } from "../shared/sentences.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §15: an `-ing` phrase bolted onto a plain fact to make it sound deeper. */
const rider =
	/^(?:highlighting|underscoring|emphasizing|reflecting|symbolizing|contributing to|cultivating|fostering|encompassing|showcasing|ensuring(?! that\b))\b/iu;

/** A rider with a verb of its own is a claim, not decoration. */
const auxiliary = /\b(?:is|are|was|were|be|been|has|have|had|will|would|can|could|that|which)\b/iu;

function ridersIn(raw: string): readonly string[] {
	return splitSentences(raw)
		.map((sentence) => trailingClause(sentence))
		.filter((clause) => rider.test(clause) && !auxiliary.test(clause));
}

/** Disallow participial riders at the end of a sentence. */
export const noShallowIngRiderRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow trailing `-ing` riders (`highlighting`, `symbolizing`, `reflecting`) in comments and documentation.",
		},
		messages: {
			shallowIngRider:
				"This clause ({{sentence}}) attaches a rider to a plain fact without saying what it adds. Keep the fact, and keep the rider only when the source supports what it claims.",
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
		return proseVisitors(context, "shallowIngRider", (segment, report) => {
			for (const clause of ridersIn(segment.raw)) {
				report(undefined, { sentence: clause });
			}
		});
	},
});
