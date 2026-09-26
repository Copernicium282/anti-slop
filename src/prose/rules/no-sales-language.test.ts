import { RuleTester } from "oxlint/plugins-dev";

import { noSalesLanguageRule } from "./no-sales-language.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "salesLanguage", data: { phrases } });

tester.run("anti-slop-prose/no-sales-language", noSalesLanguageRule, {
	valid: [
		"// The parser reads the header.",
		"/** Returns a rich value when the source allows it. */",
	],
	invalid: [
		{ code: "// Nestled within the Gonder region, the town sits on a plain.", errors: [error("nestled")] },
		{ code: "// The gallery boasts over 3,000 square feet.", errors: [error("boasts")] },
		{ code: "// A rich and profound festival.", errors: [error("rich, profound")] },
	],
});
