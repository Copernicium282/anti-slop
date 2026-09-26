import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §13: an ordinary detail said to mark a change, a legacy, or a future. */
export const noInflatedSignificanceRule = defineProsePhraseRule({
	description:
		"Disallow inflated significance (`stands as a testament`, `a pivotal moment`, `the future looks bright`) in comments and documentation.",
	messageId: "inflatedSignificance",
	message:
		"This claim ({{phrases}}) dresses a fact as a milestone. Keep the fact and drop the significance; end on the last concrete detail.",
	strong: [
		{ label: "stands as a testament", pattern: /\bstands as a testament\b/iu },
		{ label: "a testament to", pattern: /\ba testament to\b/iu },
		{ label: "pivotal", pattern: /\bpivotal\b/iu },
		{ label: "a crucial moment", pattern: /\ba crucial moment\b/iu },
		{ label: "plays a key role", pattern: /\bplays a key role\b/iu },
		{ label: "marking a", pattern: /\bmarking (?:a|the) \w+ (?:moment|turning point|milestone|era|chapter)\b/iu },
		{ label: "shaping the", pattern: /\bshaping the future\b/iu },
		{ label: "underscores its importance", pattern: /\bunderscores (?:its|the) importance\b/iu },
		{ label: "reflects a broader", pattern: /\breflects a broader\b/iu },
		{ label: "enduring legacy", pattern: /\benduring legacy\b/iu },
		{ label: "lasting legacy", pattern: /\blast(?:ing)? legacy\b/iu },
		{ label: "setting the stage for", pattern: /\bsetting the stage for\b/iu },
		{ label: "evolving landscape", pattern: /\bevolving landscape\b/iu },
		{ label: "despite these challenges", pattern: /\bdespite (?:these|its|the) challenges\b/iu },
		{ label: "continues to thrive", pattern: /\bcontinues? to thrive\b/iu },
		{ label: "the future looks bright", pattern: /\bthe future looks (?:bright|promising)\b/iu },
		{ label: "exciting times ahead", pattern: /\bexciting times (?:ahead|lie ahead)\b/iu },
		{ label: "a step in the right direction", pattern: /\ba step in the right direction\b/iu },
		{ label: "it is worth noting", pattern: /\bit(?: is|'s) worth noting\b/iu },
	],
});
