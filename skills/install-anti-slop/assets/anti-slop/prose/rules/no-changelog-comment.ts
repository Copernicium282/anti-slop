import { defineRule } from "@oxlint/plugins";

import { proseVisitors } from "../shared/prose-rule.ts";

import type { Rule } from "@oxlint/plugins";

/** Humanizer §25: documentation and comments written about the previous version. */
const history =
	/\b(?:(?:was|were|is|are)\s+(?:added|introduced|created)\s+to\s+(?:replace|deprecate|supersede))|(?:replaces?\s+the\s+(?:previous|old|earlier|legacy))|(?:in\s+(?:previous|earlier|older|prior)\s+versions?)|(?:used\s+to\s+be)|(?:prior\s+to\s+v?\d)|(?:the\s+(?:old|previous|earlier|legacy)\s+(?:approach|implementation|behaviou?r|version|codebase))|(?:previously,?\s+(?:this|it|the|we))|(?:for\s+backwards?\s+compatibility\s+with\s+the\s+old)/iu;

/** Disallow comments and documentation that describe what the code replaced. */
export const noChangelogCommentRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow comments and documentation that describe the previous implementation instead of the current behavior.",
		},
		messages: {
			changelogComment:
				"This comment describes what the code replaced. Describe what it does now; history belongs in the changelog, release notes, or migration guide.",
		},
		schema: [
			{
				type: "object",
				properties: { includeStrings: { type: "boolean" } },
				additionalProperties: false,
			},
		],
		defaultOptions: [{ includeStrings: false }],
	},
	createOnce(context) {
		return proseVisitors(context, "changelogComment", (segment, report) => {
			const match = history.exec(segment.raw);
			if (match === null) return;
			report({ offset: match.index, length: match[0].length });
		});
	},
});
