import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/**
 * Humanizer §12: the stock AI vocabulary list.
 *
 * The source skill keeps this as its only vocabulary list and warns that the words
 * stand out in groups, so the rule needs two distinct hits in the same passage.
 */
export const noAiVocabularyRule = defineProsePhraseRule({
	description:
		"Disallow stock AI vocabulary (`delve`, `tapestry`, `testament`, `pivotal`) in comments and documentation; two distinct words in one passage are enough.",
	messageId: "aiVocabulary",
	message:
		"Stock AI vocabulary ({{phrases}}) adds weight without adding facts. Use plain words. A formal word outside this list is not a tell by itself.",
	minDistinct: 2,
	extendable: true,
	weak: [
		{ label: "actually", pattern: /\bactually\b/iu },
		{ label: "additionally", pattern: /\badditionally\b/iu },
		{ label: "align with", pattern: /\baligns? with\b/iu },
		{ label: "bolstered", pattern: /\bbolster(?:ed|s)?\b/iu },
		{ label: "crucial", pattern: /\bcrucial\b/iu },
		{ label: "deep dive", pattern: /\bdeep dive\b/iu },
		{ label: "delve", pattern: /\bdelv(?:e|es|ing|ed)\b/iu },
		{ label: "emphasizing", pattern: /\bemphasiz(?:e|es|ing|ed)\b/iu },
		{ label: "enduring", pattern: /\benduring\b/iu },
		{ label: "enhance", pattern: /\benhanc(?:e|es|ing|ed)\b/iu },
		{ label: "fostering", pattern: /\bfoster(?:s|ing)?\b/iu },
		{ label: "garner", pattern: /\bgarner(?:s|ed|ing)?\b/iu },
		{ label: "gated", pattern: /\bgat(?:ed|ing)\b/iu },
		{ label: "highlight", pattern: /\bhighlight(?:s|ed|ing)?\b/iu },
		{ label: "interplay", pattern: /\binterplay\b/iu },
		{ label: "intricate", pattern: /\bintricat(?:e|es|ies)\b/iu },
		{ label: "key", pattern: /\bkey (?:insight|idea|point|benefit|advantage|detail|consideration|challenge|driver)\b/iu },
		{ label: "landscape", pattern: /\blandscape\b/iu },
		{ label: "meticulous", pattern: /\bmeticulous(?:ly)?\b/iu },
		{ label: "pivotal", pattern: /\bpivotal\b/iu },
		{ label: "quietly", pattern: /\bquietly\b/iu },
		{ label: "robust", pattern: /\brobust\b/iu },
		{ label: "showcase", pattern: /\bshowcas(?:e|es|ed|ing)\b/iu },
		{ label: "tapestry", pattern: /\btapestry\b/iu },
		{ label: "testament", pattern: /\btestament\b/iu },
		{ label: "underscore", pattern: /\bunderscor(?:e|es|ed|ing)\b/iu },
		{ label: "valuable", pattern: /\bvaluable\b/iu },
		{ label: "vibrant", pattern: /\bvibrant\b/iu },
	],
});
