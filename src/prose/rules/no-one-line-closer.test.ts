import { RuleTester } from "oxlint/plugins-dev";

import { noOneLineCloserRule } from "./no-one-line-closer.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (sentence: string) => ({ messageId: "oneLineCloser", data: { sentence } });

tester.run("anti-slop-prose/no-one-line-closer", noOneLineCloserRule, {
	valid: [
		"// The cache is keyed by request id.",
		"/** Returns the retry budget. */",
		"// Caching cuts repeat work.",
	],
	invalid: [
		{ code: "// Caching cuts repeat work. That is the real win.", errors: [error("That is the real win.")] },
		{ code: "// The queue drains. No priority. No fairness.", errors: [error("No priority.")] },
		{
			code: "// Retries are bounded. This is where the magic happens.",
			errors: [error("This is where the magic happens.")],
		},
		{ code: "// Retries are bounded. Let that sink in.", errors: [error("Let that sink in.")] },
	],
});
