import { RuleTester } from "oxlint/plugins-dev";

import { noHyphenatedPairRule } from "./no-hyphenated-pair.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (pairs: string) => ({ messageId: "hyphenatedPair", data: { pairs } });

tester.run("anti-slop-prose/no-hyphenated-pair", noHyphenatedPairRule, {
	valid: [
		"// The team is cross-functional.",
		"/** Sends a high-quality report to the caller. */",
		"// It is real-time and end-to-end.",
	],
	invalid: [
		{
			code: "// The team is cross-functional, the report is high-quality, and the method is data-driven.",
			errors: [error("cross-functional, high-quality, data-driven")],
		},
		{
			code: "// The client-facing, real-time, and long-term decisions all live here.",
			errors: [error("client-facing, real-time, long-term")],
		},
	],
});
