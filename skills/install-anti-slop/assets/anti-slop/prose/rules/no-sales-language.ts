import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §16: text that reads like an advertisement. */
export const noSalesLanguageRule = defineProsePhraseRule({
	description:
		"Disallow sales language (`nestled`, `breathtaking`, `renowned`, `boasts`) in comments and documentation.",
	messageId: "salesLanguage",
	message:
		"This wording ({{phrases}}) reads like an advertisement. State what the thing is and let the fact carry it.",
	strong: [
		{ label: "nestled", pattern: /\bnestled\b/iu },
		{ label: "in the heart of", pattern: /\bin the heart of\b/iu },
		{ label: "breathtaking", pattern: /\bbreathtaking\b/iu },
		{ label: "stunning", pattern: /\bstunning\b/iu },
		{ label: "must-visit", pattern: /\bmust-visit\b/iu },
		{ label: "boasts", pattern: /\bboasts?\b/iu },
		{ label: "renowned", pattern: /\brenowned\b/iu },
		{ label: "groundbreaking", pattern: /\bgroundbreaking\b/iu },
		{ label: "natural beauty", pattern: /\bnatural beauty\b/iu },
		{ label: "diverse array", pattern: /\bdiverse array\b/iu },
	],
	weak: [
		{ label: "rich", pattern: /\brich\b/iu },
		{ label: "featuring", pattern: /\bfeaturing\b/iu },
		{ label: "profound", pattern: /\bprofound\b/iu },
		{ label: "exemplifies", pattern: /\bexemplif(?:y|ies)\b/iu },
		{ label: "enhancing", pattern: /\benhancing\b/iu },
		{ label: "commitment to", pattern: /\bcommitment to\b/iu },
	],
});
