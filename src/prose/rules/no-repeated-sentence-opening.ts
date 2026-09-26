import { defineRule } from "@oxlint/plugins";

import { proseCountOption } from "../shared/segments.ts";
import { proseVisitors } from "../shared/prose-rule.ts";
import { openingWord, splitSentences } from "../shared/sentences.ts";

import type { Rule } from "@oxlint/plugins";

/** Openings that carry no subject, so repeating them costs the reader nothing. */
const neutralOpening = /^(?:and|but|or|so|then|also|however|although|while|when|because|that|this|these|those|it)$/u;

type RepeatedOpening = { readonly word: string; readonly sentence: string };

/** Sentences that begin a run of `limit` sentences with the same word. */
function repeatedOpenings(sentences: readonly string[], limit: number): readonly RepeatedOpening[] {
	const repeated: RepeatedOpening[] = [];
	let run = 1;
	for (const [index, sentence] of sentences.entries()) {
		const word = openingWord(sentence);
		const previous = index === 0 ? null : openingWord(sentences[index - 1] ?? "");
		if (word === null || word === previous) {
			run += 1;
		} else {
			run = 1;
		}
		if (run === limit && word !== null && !neutralOpening.test(word)) {
			repeated.push({ word, sentence });
		}
	}
	return repeated;
}

/** Disallow several sentences in a row that open with the same word. */
export const noRepeatedSentenceOpeningRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow several consecutive sentences in one comment or string that begin with the same word.",
		},
		messages: {
			repeatedOpening:
				'This sentence continues a run of {{run}} that start with "{{word}}". Merge them, change the subject, or begin with the action; deliberate repetition for rhythm is still yours to keep.',
		},
		schema: [
			{
				type: "object",
				properties: {
					includeStrings: { type: "boolean" },
					runLength: { type: "integer", minimum: 2 },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false, runLength: 3 }],
	},
	createOnce(context) {
		return proseVisitors(context, "repeatedOpening", (segment, report) => {
			const runLength = proseCountOption(context, "runLength", 3);
			for (const opening of repeatedOpenings(splitSentences(segment.raw), runLength)) {
				report(undefined, { word: opening.word, run: `${runLength} sentences` });
			}
		});
	},
});
