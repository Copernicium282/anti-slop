import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §4: the writer announces the point instead of making it. */
export const noStagedRunupRule = defineProsePhraseRule({
	description:
		"Disallow staged openers (`let's dive in`, `here's what you need to know`, `heads up`) in comments and documentation.",
	messageId: "stagedRunup",
	message:
		"This opener ({{phrases}}) stages the moment instead of making the point. Cut the run-up and state the claim directly.",
	strong: [
		{ label: "let's dive in", pattern: /\blet'?s dive in(?:to)?\b/iu },
		{ label: "let's explore", pattern: /\blet'?s explore\b/iu },
		{ label: "let's break this down", pattern: /\blet'?s break (?:this|it) down\b/iu },
		{ label: "here's what you need to know", pattern: /\bhere(?: is|'s) what you need to know\b/iu },
		{ label: "now let's look at", pattern: /\bnow let'?s (?:look|take a look|dive) (?:at|into)\b/iu },
		{ label: "without further ado", pattern: /\bwithout further ado\b/iu },
		{ label: "heads up", pattern: /\bheads up[,:]/iu },
		{ label: "quick note", pattern: /\bquick note\b/iu },
		{ label: "here's the thing", pattern: /\bhere(?: is|'s) the thing\b/iu },
		{ label: "the thing is", pattern: /\bthe thing is\b/iu },
		{ label: "let's be honest", pattern: /\blet'?s be honest\b/iu },
		{ label: "real talk", pattern: /\breal talk\b/iu },
		{ label: "Honestly?", pattern: /(?:^|[.!?]\s+)honestly\?/iu },
		{ label: "Here's the thing", pattern: /(?:^|[.!?]\s+)look,[\s]/iu },
	],
});
