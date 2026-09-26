import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §18: a long phrase standing in for `is`, `are`, or `has`. */
export const noCopulaAvoidanceRule = defineProsePhraseRule({
	description:
		"Disallow long phrases that stand in for a simple verb (`serves as`, `functions as`, `refers to`) in comments and documentation.",
	messageId: "copulaAvoidance",
	message:
		"This phrase ({{phrases}}) replaces a simple verb with a longer one. Use `is`, `are`, or `has` and keep the sentence short.",
	strong: [
		{ label: "serves as", pattern: /\bserves as\b/iu },
		{ label: "stands as", pattern: /\bstands as\b/iu },
		{ label: "functions as", pattern: /\bfunctions as\b/iu },
		{ label: "operates as", pattern: /\boperates as\b/iu },
		{ label: "refers to", pattern: /\brefers to\b/iu },
		{ label: "marks a", pattern: /\bmarks an? \w+/iu },
		{ label: "represents a", pattern: /\brepresents an? \w+/iu },
	],
});
