import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §9: qualifiers added one after another until nothing is asserted. */
export const noStackedQualifierRule = defineProsePhraseRule({
	description:
		"Disallow stacked qualifiers (`could potentially`, `might arguably`, `to be fair`) in comments and documentation; two in one passage are enough.",
	messageId: "stackedQualifier",
	message:
		"Qualifiers are stacked here ({{phrases}}), so the claim asserts nothing. Keep only the qualifier the source supports; ordinary hedges such as `perhaps` are not a tell.",
	minDistinct: 2,
	weak: [
		{ label: "could potentially", pattern: /\bcould potentially\b/iu },
		{ label: "might arguably", pattern: /\bmight arguably\b/iu },
		{ label: "to be fair", pattern: /\bto be fair\b/iu },
		{ label: "it's also possible", pattern: /\bit(?: is|'s) also possible\b/iu },
		{ label: "in some cases it may", pattern: /\bin some cases it may\b/iu },
		{ label: "this is an inference", pattern: /\bthis is an inference\b/iu },
		{ label: "possibly", pattern: /\bpossibly\b/iu },
		{ label: "arguably", pattern: /\barguably\b/iu },
		{ label: "in some measure", pattern: /\bin (?:some measure|some cases)\b/iu },
		{ label: "it could be argued", pattern: /\bit could be argued\b/iu },
	],
});
