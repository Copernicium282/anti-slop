import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §5: the text answers an objection that appears nowhere else. */
export const noUnraisedObjectionRule = defineProsePhraseRule({
	description:
		"Disallow arguments with no one (`this isn't mainly about`, `to be clear`, `a tempting approach would be`) in comments and documentation.",
	messageId: "unraisedObjection",
	message:
		"This passage ({{phrases}}) answers an objection nobody raised. Remove the defense and state the claim it was protecting.",
	strong: [
		{ label: "this isn't mainly about", pattern: /\bthis isn'?t (?:mainly )?about\b/iu },
		{ label: "this is not about", pattern: /\bthis is not (?:mainly )?about\b/iu },
		{ label: "I'm not saying", pattern: /\bi'?m not saying\b/iu },
		{ label: "to be clear", pattern: /\bto be clear\b/iu },
		{ label: "don't get me wrong", pattern: /\bdon'?t get me wrong\b/iu },
		{ label: "this is not to say", pattern: /\bthis is not to say\b/iu },
		{ label: "some might say", pattern: /\bsome (?:people|might|would) (?:say|argue|claim)\b/iu },
		{ label: "one might argue", pattern: /\bone might (?:argue|be tempted to)\b/iu },
		{ label: "a tempting approach would be", pattern: /\ba tempting approach would be\b/iu },
		{ label: "an obvious approach would be", pattern: /\ban obvious approach would be\b/iu },
		{ label: "you might think", pattern: /\byou might think\b/iu },
		{ label: "it would be easy to just", pattern: /\bit would be easy to just\b/iu },
	],
});
