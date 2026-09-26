import { RuleTester } from "oxlint/plugins-dev";

import { noNotButContrastRule } from "./no-not-but-contrast.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "notButContrast" };
const withStrings = [{ includeStrings: true }];

tester.run("anti-slop-prose/no-not-but-contrast", noNotButContrastRule, {
	valid: [
		"// Parse the value before it reaches the store.",
		"/** Not every retry needs backoff; the first one is enough. */",
		"// The value is a string but not a numeric literal.",
		"// This affects not only clients but also servers.",
		"const message = \"The request was not authorized\";",
	],
	invalid: [
		{ code: "// It's not just a cache; it's the source of truth.", errors: [error] },
		{ code: "/**\n * This is not merely a refactor.\n */", errors: [error] },
		{
			code: "// This does not mean every choice is equal. It means there is no external check.",
			errors: [error],
		},
		{
			code: 'const summary = "It\'s not just faster, it\'s cheaper.";',
			options: withStrings,
			errors: [error],
		},
	],
});
