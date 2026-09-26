import { RuleTester } from "oxlint/plugins-dev";

import { noGlobalRegexReplaceRule } from "./no-global-regex-replace.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "globalRegexReplace" };

tester.run("anti-slop/no-global-regex-replace", noGlobalRegexReplaceRule, {
	valid: [
		'const cleaned = text.replaceAll(" ", "");',
		'const first = text.replace(/needle/, "value");',
		'const pattern = /needle/g;\nconst matches = text.matchAll(pattern);',
	],
	invalid: [
		{ code: 'const cleaned = text.replace(/ /g, "");', errors: [error] },
		{ code: 'const slug = title.replace(/[^a-z]+/g, "-");', errors: [error] },
	],
});
