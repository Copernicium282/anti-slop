import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §3: an ordinary point dressed as a hidden truth. */
export const noPhilosophicalSayingRule = defineProsePhraseRule({
	description:
		"Disallow sayings that sound deep (`at its core`, `the real question is`, `X is the language of Y`) in comments and documentation.",
	messageId: "philosophicalSaying",
	message:
		"This saying ({{phrases}}) dresses an ordinary point as a hidden truth. Replace it with the specific claim the passage is making.",
	strong: [
		{ label: "at its core", pattern: /\bat its core\b/iu },
		{ label: "the real question is", pattern: /\bthe real question is\b/iu },
		{ label: "what really matters", pattern: /\bwhat really matters\b/iu },
		{ label: "in reality", pattern: /\bin reality,?/iu },
		{ label: "fundamentally", pattern: /\bfundamentally\b/iu },
		{ label: "the deeper issue", pattern: /\bthe deeper issue\b/iu },
		{ label: "the heart of the matter", pattern: /\bthe heart of the matter\b/iu },
		{ label: "is the language of", pattern: /\bis the language of\b/iu },
		{ label: "is the currency of", pattern: /\bis the currency of\b/iu },
		{ label: "is the architecture of", pattern: /\bis the architecture of\b/iu },
		{ label: "becomes a trap", pattern: /\bbecomes a trap\b/iu },
	],
});
