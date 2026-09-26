import { RuleTester } from "oxlint/plugins-dev";

import { noParameterPropertyRule } from "./no-parameter-property.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "parameterProperty" };

tester.run("anti-slop/no-parameter-property", noParameterPropertyRule, {
	valid: [
		"class Point {\n\tid: string;\n\tconstructor(id: string) {\n\t\tthis.id = id;\n\t}\n}",
		"class Counter {\n\tcount = 0;\n\tincrement(by = 1) {\n\t\tthis.count += by;\n\t}\n}",
		"function save(value: string) { return value; }",
	],
	invalid: [
		{ code: "class Point {\n\tconstructor(public id: string) {}\n}", errors: [error] },
		{
			code: "class Service {\n\tconstructor(private readonly port: number) {}\n}",
			errors: [error],
		},
	],
});
