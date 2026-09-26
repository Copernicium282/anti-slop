import { defineProsePhraseRule } from "../shared/prose-rule.ts";

/** Humanizer §14: two things said to be connected without saying how. */
export const noVagueAssociationRule = defineProsePhraseRule({
	description:
		"Disallow vague connections (`associated with`, `in connection with`, `linked to`) in comments and documentation.",
	messageId: "vagueAssociation",
	message:
		"This phrase ({{phrases}}) says two things are connected without saying how. Name the relationship the source actually gives; if it does not, keep the plain wording instead of inventing a role.",
	strong: [
		{ label: "associated with", pattern: /\b(?:is|was|are|were|been)?\s*associated with\b/iu },
		{ label: "in association with", pattern: /\bin association with\b/iu },
		{ label: "in connection with", pattern: /\bin connection with\b/iu },
		{ label: "connected to", pattern: /\bconnected to\b/iu },
		{ label: "linked to", pattern: /\blinked to\b/iu },
		{ label: "tied to", pattern: /\btied to\b/iu },
		{ label: "in relation to", pattern: /\bin relation to\b/iu },
	],
});
