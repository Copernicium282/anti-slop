import { RuleTester } from "oxlint/plugins-dev";

import { noStagedRunupRule } from "./no-staged-runup.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "stagedRunup", data: { phrases } });

tester.run("anti-slop-prose/no-staged-runup", noStagedRunupRule, {
	valid: [
		"// Parse the payload before rendering it.",
		"/** Returns the retry budget for a request. */",
		'const hint = "Look up the id in the index.";',
	],
	invalid: [
		{ code: "// Let's dive into how caching works.", errors: [error("let's dive in")] },
		{
			code: "// Here's what you need to know about retries.",
			errors: [error("here's what you need to know")],
		},
		{ code: "// Heads up: the schema changed.", errors: [error("heads up")] },
		{ code: "/**\n * Let's break this down.\n */", errors: [error("let's break this down")] },
	],
});
