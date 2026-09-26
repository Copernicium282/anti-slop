import { defineRule } from "@oxlint/plugins";

import { proseNumberOption } from "../shared/segments.ts";
import { proseVisitors } from "../shared/prose-rule.ts";

import type { Rule } from "@oxlint/plugins";

/**
 * Humanizer §8: dashes used as the universal connector.
 *
 * Spaced em dashes, en dashes, and `--` all count. A dash needs a word on both sides,
 * so hyphens inside identifiers such as `end-to-end` are left alone.
 */
const dashConnector = /(?<=\p{L})[ \t]*(?:\u2014|\u2013|--)[ \t]*(?=\p{L})/gu;

type DashHit = { readonly offset: number; readonly length: number };

function dashHits(raw: string): readonly DashHit[] {
	const hits: DashHit[] = [];
	for (const match of raw.matchAll(dashConnector)) {
		hits.push({ offset: match.index, length: match[0].length });
	}
	return hits;
}

/** Disallow dash connectors in comments and documentation. */
export const noDashAsConnectorRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow em dashes, en dashes, and spaced double hyphens used to join clauses in comments and documentation.",
		},
		messages: {
			dashConnector:
				"This dash joins two clauses instead of choosing how they relate. Use a period, comma, colon, or parentheses, or rewrite the sentence.",
		},
		schema: [
			{
				type: "object",
				properties: {
					includeStrings: { type: "boolean" },
					maxDashes: { type: "integer", minimum: 0 },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false, maxDashes: 0 }],
	},
	createOnce(context) {
		return proseVisitors(context, "dashConnector", (segment, report) => {
			const budget = proseNumberOption(context, "maxDashes", 0);
			for (const [index, hit] of dashHits(segment.raw).entries()) {
				if (index < budget) continue;
				report({ offset: hit.offset, length: hit.length });
			}
		});
	},
});
