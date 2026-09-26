import { RuleTester } from "oxlint/plugins-dev";

import { noInflatedSignificanceRule } from "./no-inflated-significance.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "inflatedSignificance", data: { phrases } });

tester.run("anti-slop-prose/no-inflated-significance", noInflatedSignificanceRule, {
	valid: [
		"// Retries hide brief outages.",
		"/** Established in 1989 as a regional statistics office. */",
		'const summary = "The change ships in the next release.";',
	],
	invalid: [
		{
			code: "// Established in 1989, marking a pivotal moment in regional statistics.",
			errors: [{ messageId: "inflatedSignificance", data: { phrases: "pivotal, marking a" } }],
		},
		{ code: "// The future looks bright for the team.", errors: [error("the future looks bright")] },
		{ code: "// It is worth noting that the cache expires.", errors: [error("it is worth noting")] },
		{
			code: "// Despite these challenges, the service continues to thrive.",
			errors: [error("despite these challenges, continues to thrive")],
		},
	],
});
