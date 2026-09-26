import { RuleTester } from "oxlint/plugins-dev";

import { noCopulaAvoidanceRule } from "./no-copula-avoidance.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "copulaAvoidance", data: { phrases } });

tester.run("anti-slop-prose/no-copula-avoidance", noCopulaAvoidanceRule, {
	valid: [
		"// The value is a string once the header is parsed.",
		"/** Has four rooms and a small archive. */",
	],
	invalid: [
		{ code: "// Gallery 825 serves as the exhibition space.", errors: [error("serves as")] },
		{ code: "// The module functions as a registry of handlers.", errors: [error("functions as")] },
		{ code: "// The field refers to the owner of the record.", errors: [error("refers to")] },
	],
});
