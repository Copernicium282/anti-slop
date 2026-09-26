import { RuleTester } from "oxlint/plugins-dev";

import { noSmartQuotesRule } from "./no-smart-quotes.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "smartQuotes" };

tester.run("anti-slop-prose/no-smart-quotes", noSmartQuotesRule, {
	valid: [
		"// The parser rejects unknown fields.",
		'const quoted = "plain text";',
		{ code: 'const quoted = "\u201cstyled\u201d text";', options: [{ maxCurlyQuotes: 2 }] },
	],
	invalid: [
		{ code: "// He said \u201cthe project is on track\u201d but others disagreed.", errors: [error, error] },
		{ code: 'const quoted = "the \u201csmart\u201d quote";', errors: [error, error] },
	],
});
