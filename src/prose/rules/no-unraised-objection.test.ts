import { RuleTester } from "oxlint/plugins-dev";

import { noUnraisedObjectionRule } from "./no-unraised-objection.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "unraisedObjection", data: { phrases } });

tester.run("anti-slop-prose/no-unraised-objection", noUnraisedObjectionRule, {
	valid: [
		"// The queue drains on the next tick.",
		"/** Rotates the token in place. */",
		'const detail = "Clear the buffer before the next read.";',
	],
	invalid: [
		{ code: "// This isn't mainly about prompt length.", errors: [error("this isn't mainly about")] },
		{ code: "// To be clear, documentation still matters.", errors: [error("to be clear")] },
		{
			code: "// A tempting approach would be to restart the service.",
			errors: [error("a tempting approach would be")],
		},
		{
			code: "// Some might say this is premature, but the cache needs it.",
			errors: [error("some might say")],
		},
	],
});
