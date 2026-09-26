import { RuleTester } from "oxlint/plugins-dev";

import { noWrapperObjectTypesRule } from "./no-wrapper-object-types.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (name: string, primitive: string) => ({
	messageId: "wrapperObjectType",
	data: { name, primitive },
});

tester.run("anti-slop/no-wrapper-object-types", noWrapperObjectTypesRule, {
	valid: [
		"function save(value: string) { return value; }",
		"const count = new Map<string, number>();",
		"function wrap(value: unknown): unknown { return value; }",
		"interface Props { size: number }",
	],
	invalid: [
		{ code: "function save(value: String) { return value; }", errors: [error("String", "string")] },
		{ code: "function load(): Number { return input; }", errors: [error("Number", "number")] },
		{ code: "type Flag = Boolean;", errors: [error("Boolean", "boolean")] },
		{ code: "function tag(value: Symbol) { return value; }", errors: [error("Symbol", "symbol")] },
	],
});
