import { RuleTester } from "oxlint/plugins-dev";

import { noEnumDeclarationRule } from "./no-enum-declaration.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "enumDeclaration" };

tester.run("anti-slop/no-enum-declaration", noEnumDeclarationRule, {
	valid: [
		'const Direction = { Up: "up", Down: "down" } as const;\ntype Direction = (typeof Direction)[keyof typeof Direction];',
		"type Level = \"info\" | \"warn\";",
		"const levels = [\"info\", \"warn\"];",
	],
	invalid: [
		{ code: "enum Direction { Up, Down }", errors: [error] },
		{ code: "declare enum Level { Info = \"info\" }", errors: [error] },
		{ code: "export enum Status { Ready, Failed }", errors: [error] },
	],
});
