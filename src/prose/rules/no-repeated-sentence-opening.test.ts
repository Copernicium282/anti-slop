import { RuleTester } from "oxlint/plugins-dev";

import { noRepeatedSentenceOpeningRule } from "./no-repeated-sentence-opening.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (word: string) => ({
	messageId: "repeatedOpening",
	data: { word, run: "3 sentences" },
});

tester.run("anti-slop-prose/no-repeated-sentence-opening", noRepeatedSentenceOpeningRule, {
	valid: [
		"// She noted the door. She filed it away.",
		"// Cache the value. Then write it. Then log it.",
		{ code: "// Cache it. Log it. Ship it.", options: [{ runLength: 4 }] },
	],
	invalid: [
		{
			code: "// She noted the door. She noted the lock. She filed both away.",
			errors: [error("she")],
		},
		{
			code: "// The cache holds rows. The cache writes them. The cache expires.",
			errors: [error("the")],
		},
	],
});
