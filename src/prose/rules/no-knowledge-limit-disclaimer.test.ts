import { RuleTester } from "oxlint/plugins-dev";

import { noKnowledgeLimitDisclaimerRule } from "./no-knowledge-limit-disclaimer.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "knowledgeLimitDisclaimer", data: { phrases } });

tester.run("anti-slop-prose/no-knowledge-limit-disclaimer", noKnowledgeLimitDisclaimerRule, {
	valid: [
		"// The parser rejects unknown fields.",
		"/** Returns the schema the source declares. */",
	],
	invalid: [
		{
			code: "// Based on available information, the service started in 2019.",
			errors: [error("based on available information")],
		},
		{ code: "// It is believed that the founder met the team in 2015.", errors: [error("it is believed that")] },
		{
			code: "// Her early life is not publicly available, so she likely grew up abroad.",
			errors: [error("not publicly available, likely grew up")],
		},
	],
});
