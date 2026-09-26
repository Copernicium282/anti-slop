import { RuleTester } from "oxlint/plugins-dev";

import { noDecorativeFormattingRule } from "./no-decorative-formatting.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (kind: string) => ({ messageId: "decorativeFormatting", data: { kind } });

tester.run("anti-slop-prose/no-decorative-formatting", noDecorativeFormattingRule, {
	valid: [
		"// Parse the header before rendering the body.",
		"/** Returns the value the caller stored. */",
		'const flag = "value";',
	],
	invalid: [
		{ code: "// **Performance:** The update is faster.", errors: [error("bold label")] },
		{ code: "// \u{1F680} Launch phase: the product ships in Q3.", errors: [error("decorative emoji")] },
		{ code: "/**\n * **Note**\n * The schema changed.\n */", errors: [error("bold decoration")] },
	],
});
