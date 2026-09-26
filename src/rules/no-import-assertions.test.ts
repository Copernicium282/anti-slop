import { RuleTester } from "oxlint/plugins-dev";

import { noImportAssertionsRule } from "./no-import-assertions.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "importAssertions" };

tester.run("anti-slop/no-import-assertions", noImportAssertionsRule, {
	valid: [
		'import data from "./data.json" with { type: "json" };',
		'import { readFile } from "node:fs/promises";',
		'const attributes = [{ type: "json" }];',
	],
	invalid: [
		{ code: 'import data from "./data.json" with { asserts: "json" };', errors: [error] },
	],
});
