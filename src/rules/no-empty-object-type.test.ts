import { RuleTester } from "oxlint/plugins-dev";

import { noEmptyObjectTypeRule } from "./no-empty-object-type.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "emptyObjectType" };

tester.run("anti-slop/no-empty-object-type", noEmptyObjectTypeRule, {
	valid: [
		"function save(value: object) { return value; }",
		"type Metadata = Record<string, unknown>;",
		"type OtherMetadata = { [key: string]: object };",
		"const empty = {};",
		"type Pair = [string, number];",
	],
	invalid: [
		{ code: "function save(value: {}) { return value; }", errors: [error] },
		{ code: "function load(): {} { return input; }", errors: [error] },
		{ code: "type Payload = {};", errors: [error] },
		{ code: "function save(value: { id: string } | {}) { return value; }", errors: [error] },
	],
});
