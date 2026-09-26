import { defineRule } from "@oxlint/plugins";

import { proseNumberOption } from "../shared/segments.ts";
import { proseVisitors } from "../shared/prose-rule.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §21: curly quotes where the source or target format uses straight ones. */
const curlyQuote = /[\u201c\u201d\u2018\u2019]/gu;

type QuoteHit = { readonly offset: number; readonly length: number };

function quoteHits(raw: string): readonly QuoteHit[] {
	return [...raw.matchAll(curlyQuote)].map((match) => ({
		offset: match.index,
		length: match[0].length,
	}));
}

/** Disallow curly quotation marks in comments and string literals. */
export const noSmartQuotesRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow curly quotation marks and apostrophes in comments and string literals.",
		},
		messages: {
			smartQuotes:
				"This curly quote does not match the surrounding code style. Use the straight quote `\"` unless the target format calls for typographic quotes.",
		},
		schema: [
			{
				type: "object",
				properties: {
					includeStrings: { type: "boolean" },
					maxCurlyQuotes: { type: "integer", minimum: 0 },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: true, maxCurlyQuotes: 0 }],
	},
	createOnce(context) {
		return proseVisitors(context, "smartQuotes", (segment, report) => {
			const budget = proseNumberOption(context, "maxCurlyQuotes", 0);
			for (const [index, hit] of quoteHits(segment.raw).entries()) {
				if (index < budget) continue;
				report({ offset: hit.offset, length: hit.length });
			}
		});
	},
});
