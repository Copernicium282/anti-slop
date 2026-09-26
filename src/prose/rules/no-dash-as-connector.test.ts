import { RuleTester } from "oxlint/plugins-dev";

import { noDashAsConnectorRule } from "./no-dash-as-connector.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "dashConnector" };

tester.run("anti-slop-prose/no-dash-as-connector", noDashAsConnectorRule, {
	valid: [
		"// The retry path is end-to-end.",
		{ code: "// Parse the value, then write it.", options: [{ maxDashes: 1 }] },
		"const ratio = 3 - 2;",
	],
	invalid: [
		{
			code: "// The new policy \u2014 announced without warning \u2014 affects thousands of workers.",
			errors: [error, error],
		},
		{ code: "// The changes -- long overdue according to critics -- take effect today.", errors: [error, error] },
		{ code: "// The value \u2013 when parsed \u2013 is a number.", errors: [error, error] },
	],
});
