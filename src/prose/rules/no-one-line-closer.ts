import { defineRule } from "@oxlint/plugins";

import { proseCountOption } from "../shared/segments.ts";
import { proseVisitors } from "../shared/prose-rule.ts";
import { isShortSentence, splitSentences, withoutTerminalPunctuation, wordCount } from "../shared/sentences.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §2: closers written as ready-made sentences. */
const stockClosers =
	/\b(?:that(?:'s| is) (?:the )?(?:real )?(?:win|point|key|takeaway|deal)|read that again|let that sink in|and there you have it|this is where (?:it|the magic) happens)\b/iu;

/** A demonstrative sentence that only points back at the paragraph above it. */
const demonstrativeOpener = /^(?:this|that|these|those|it|here)\s+\w+/iu;

/** A bare fragment such as "No aesthetic prior." carries no verb and no subject. */
const fragment = /^[\p{L}][\p{L}'-]*(?:\s+[\p{L}][\p{L}'-]*){0,2}$/u;

/** Words that turn a short sentence into a real clause. */
const clauseWord =
	/\b(?:the|a|an|this|that|these|those|it|they|we|you|he|she|is|are|was|were|has|have|had|will|would|can|could|should|must|and|or|but|of|to|in|on|at|by|for|with|from|that|which)\b/iu;

function isFragment(sentence: string): boolean {
	const text = withoutTerminalPunctuation(sentence);
	return fragment.test(text) && wordCount(text) <= 3 && !clauseWord.test(text);
}

/** A fragment row only reads as a row when another fragment follows it. */
function closingSentences(sentences: readonly string[], maxWords: number): readonly string[] {
	const closers: string[] = [];
	for (const [index, sentence] of sentences.entries()) {
		const next = sentences[index + 1];
		if (
			stockClosers.test(sentence) ||
			(isShortSentence(sentence, maxWords) && demonstrativeOpener.test(withoutTerminalPunctuation(sentence))) ||
			(next !== undefined && isFragment(sentence) && isFragment(next))
		) {
			closers.push(sentence);
		}
	}
	return closers;
}

/** Disallow one-line closers, stock punchlines, and rows of fragments in prose. */
export const noOneLineCloserRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow one-line closers, stock punchlines, and rows of dramatic fragments in comments and documentation.",
		},
		messages: {
			oneLineCloser:
				"This line ({{sentence}}) asks the reader to pause instead of adding a claim. Cut the closer that repeats the paragraph, or merge the fragments into one specific claim.",
		},
		schema: [
			{
				type: "object",
				properties: {
					includeStrings: { type: "boolean" },
					maxWords: { type: "integer", minimum: 1 },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false, maxWords: 8 }],
	},
	createOnce(context) {
		return proseVisitors(context, "oneLineCloser", (segment, report) => {
			const maxWords = proseCountOption(context, "maxWords", 8);
			for (const sentence of closingSentences(splitSentences(segment.raw), maxWords)) {
				report(undefined, { sentence });
			}
		});
	},
});
