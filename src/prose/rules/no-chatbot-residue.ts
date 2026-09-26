import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §22: a chatbot's greeting, praise, offer, or closing left in the file. */
export const noChatbotResidueRule = defineProsePhraseRule({
	description:
		"Disallow chatbot residue (`I hope this helps`, `Great question!`, `let me know`) in comments and documentation.",
	messageId: "chatbotResidue",
	message:
		"This chatbot wrapper ({{phrases}}) belongs in the conversation, not the file. Remove the greeting, the offer, and the closing and keep the content.",
	strong: [
		{ label: "I hope this helps", pattern: /\bi hope this helps\b/iu },
		{ label: "I hope that helps", pattern: /\bi hope that helps\b/iu },
		{ label: "great question", pattern: /\bgreat question\b/iu },
		{ label: "certainly!", pattern: /\bcertainly!/iu },
		{ label: "of course!", pattern: /\bof course!/iu },
		{ label: "you're absolutely right", pattern: /\byou(?:'re| are) absolutely right\b/iu },
		{ label: "would you like", pattern: /\bwould you like\b/iu },
		{ label: "want me to", pattern: /\bwant me to\b/iu },
		{ label: "should I continue", pattern: /\bshould i continue\b/iu },
		{ label: "let me know", pattern: /\blet me know\b/iu },
		{ label: "here is a", pattern: /\bhere(?: is|'s) an? \w+/iu },
		{ label: "feel free to ask", pattern: /\bfeel free to ask\b/iu },
		{ label: "don't hesitate to ask", pattern: /\bdon'?t hesitate to ask\b/iu },
		{ label: "happy to help", pattern: /\bhappy to help\b/iu },
	],
});
