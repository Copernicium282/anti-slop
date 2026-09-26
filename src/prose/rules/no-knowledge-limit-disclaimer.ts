import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §23: the text names the edge of its knowledge, then guesses past it. */
export const noKnowledgeLimitDisclaimerRule = defineProsePhraseRule({
	description:
		"Disallow knowledge-limit disclaimers and guesses (`not publicly available`, `it is believed that`, `as of my last update`) in comments and documentation.",
	messageId: "knowledgeLimitDisclaimer",
	message:
		"This sentence ({{phrases}}) marks where the source stops and then fills the gap with a guess. State what the source shows, or drop the sentence; never present a guess as a fact.",
	strong: [
		{ label: "as of my last update", pattern: /\bas of my last (?:update|training|knowledge)\b/iu },
		{ label: "up to my last training update", pattern: /\bup to my (?:last )?training (?:update|cutoff|data)\b/iu },
		{ label: "details are limited", pattern: /\b(?:specific )?details (?:are|remain) limited\b/iu },
		{ label: "based on available information", pattern: /\bbased on available information\b/iu },
		{ label: "not publicly available", pattern: /\bnot publicly available\b/iu },
		{ label: "not widely documented", pattern: /\bnot (?:widely|extensively|publicly) (?:documented|disclosed)\b/iu },
		{ label: "in the provided sources", pattern: /\bin the (?:provided|available) sources?\b/iu },
		{ label: "readily available sources", pattern: /\breadily available sources?\b/iu },
		{ label: "maintains a low profile", pattern: /\bmaintains? a low profile\b/iu },
		{ label: "it is believed that", pattern: /\bit(?: is|'s) believed that\b/iu },
		{ label: "it appears to have been", pattern: /\bit appears to have been\b/iu },
		{ label: "likely grew up", pattern: /\blikely (?:grew up|studied|began|worked)\b/iu },
		{ label: "is said to have", pattern: /\bis said to have\b/iu },
	],
});
