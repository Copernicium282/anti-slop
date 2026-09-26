import { RuleTester } from "oxlint/plugins-dev";

import { noStackedQualifierRule } from "./no-stacked-qualifier.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "stackedQualifier", data: { phrases } });

tester.run("anti-slop-prose/no-stacked-qualifier", noStackedQualifierRule, {
	valid: [
		"// The value is perhaps null.",
		"/** Returns the policy the caller configured. */",
	],
	invalid: [
		{
			code: "// It could potentially possibly be argued that the policy helps.",
			errors: [error("could potentially, possibly")],
		},
		{
			code: "// To be fair, it's also possible that this is fine.",
			errors: [error("to be fair, it's also possible")],
		},
		{ code: "// Arguably the cache is possibly stale.", errors: [error("possibly, arguably")] },
	],
});
