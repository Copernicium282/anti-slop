import { defineRule } from "@oxlint/plugins";

import { proseVisitors } from "../shared/prose-rule.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §19 and §20: decoration applied to every item. */

/** `- **Performance:** The update is faster.` with the colon inside the bold. */
const boldLabelInside = /\*\*[^*\n]{1,60}:\*\*/gu;

/** `- **Performance**: The update is faster.` with the colon outside the bold. */
const boldLabelOutside = /\*\*[^*\n]{1,60}?\*\*\s*:/gu;

/** A bold word standing alone at the start of a line, ignoring JSDoc decoration. */
const boldLeading = /(?:^|\n)[ \t]*\**[ \t]?\*\*[^*\n]{1,40}?\*\*/gu;

/** Emoji used as decoration, including arrows and an optional variation selector. */
const decorativeEmoji =
	/[\u{1F300}-\u{1FAFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}](?:\u{FE0F})?/gu;

type DecorationHit = { readonly offset: number; readonly length: number; readonly kind: string };

function collect(raw: string, kind: string, pattern: RegExp): readonly DecorationHit[] {
	return [...raw.matchAll(pattern)].map((match) => ({
		offset: match.index,
		length: match[0].length,
		kind,
	}));
}

function overlaps(hit: DecorationHit, others: readonly DecorationHit[]): boolean {
	return others.some(
		(other) => hit.offset < other.offset + other.length && other.offset < hit.offset + hit.length,
	);
}

function decorationHits(raw: string): readonly DecorationHit[] {
	const labels = [
		...collect(raw, "bold label", boldLabelInside),
		...collect(raw, "bold label", boldLabelOutside),
	];
	const others = [
		...collect(raw, "bold decoration", boldLeading),
		...collect(raw, "decorative emoji", decorativeEmoji),
	];
	// A bold label is the better description of the same span.
	return [...labels, ...others.filter((hit) => !overlaps(hit, labels))].sort(
		(left, right) => left.offset - right.offset,
	);
}

/** Disallow bold labels, bold decoration, and emoji in comments and documentation. */
export const noDecorativeFormattingRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow bold used as decoration (`**Performance:**`), bold standing alone on a line, and decorative emoji in comments and documentation.",
		},
		messages: {
			decorativeFormatting:
				"This {{kind}} is decoration applied by rule. Remove it and write the sentence; turn a labeled list into prose when the labels carry no information of their own.",
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
		return proseVisitors(context, "decorativeFormatting", (segment, report) => {
			for (const hit of decorationHits(segment.raw)) {
				report({ offset: hit.offset, length: hit.length }, { kind: hit.kind });
			}
		});
	},
});
