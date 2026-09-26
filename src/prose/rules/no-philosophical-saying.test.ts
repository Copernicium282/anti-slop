import { RuleTester } from "oxlint/plugins-dev";

import { noPhilosophicalSayingRule } from "./no-philosophical-saying.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "philosophicalSaying", data: { phrases } });

tester.run("anti-slop-prose/no-philosophical-saying", noPhilosophicalSayingRule, {
	valid: [
		"// Sort the events by timestamp before rendering.",
		"/** Returns the id of the selected row. */",
		'const note = "The cache expires after a minute.";',
	],
	invalid: [
		{ code: "// At its core, this is a caching layer.", errors: [error("at its core")] },
		{ code: "// The real question is whether the agent retries.", errors: [error("the real question is")] },
		{ code: "// Symmetry is the language of trust.", errors: [error("is the language of")] },
		{
			code: 'const summary = "Fundamentally, the queue is the bottleneck.";',
			options: [{ includeStrings: true }],
			errors: [error("fundamentally")],
		},
	],
});
