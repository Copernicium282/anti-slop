import { defineRule } from "@oxlint/plugins";

import { proseCountOption } from "../shared/segments.ts";
import { proseVisitors } from "../shared/prose-rule.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §10: pairs hyphenated in every position. */
const hyphenatedPair =
	/\b(third-party|cross-functional|client-facing|data-driven|decision-making|well-known|high-quality|real-time|long-term|end-to-end|state-of-the-art|cost-effective|future-proof)\b/giu;

type PairHit = { readonly pair: string; readonly offset: number; readonly length: number };

function pairHits(raw: string): readonly PairHit[] {
	const hits: PairHit[] = [];
	for (const match of raw.matchAll(hyphenatedPair)) {
		hits.push({ pair: match[0].toLowerCase(), offset: match.index, length: match[0].length });
	}
	return hits;
}

/**
 * Disallow hyphenated pairs used throughout a passage.
 *
 * The source skill calls this tell weak on its own, so the rule counts distinct
 * pairs in one passage instead of reporting every hyphen.
 */
export const noHyphenatedPairRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow repeated hyphenated pairs (`cross-functional`, `high-quality`, `data-driven`) in one comment or string.",
		},
		messages: {
			hyphenatedPair:
				"This passage hyphenates {{pairs}} in every position. Keep the hyphen only where grammar needs it, as in `a high-quality report`.",
		},
		schema: [
			{
				type: "object",
				properties: {
					includeStrings: { type: "boolean" },
					minDistinct: { type: "integer", minimum: 1 },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false, minDistinct: 3 }],
	},
	createOnce(context) {
		return proseVisitors(context, "hyphenatedPair", (segment, report) => {
			const minimum = proseCountOption(context, "minDistinct", 3);
			const hits = pairHits(segment.raw);
			const distinct = [...new Set(hits.map((hit) => hit.pair))];
			if (distinct.length < minimum) return;
			const first = hits[0];
			if (first === undefined) return;
			report({ offset: first.offset, length: first.length }, { pairs: distinct.join(", ") });
		});
	},
});
