import { RuleTester } from "oxlint/plugins-dev";

import { noUnsupportedJsdocTagRule } from "./no-unsupported-jsdoc-tag.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (tag: string, replacement: string) => ({
	messageId: "unsupportedJsdocTag",
	data: { tag, replacement },
});

tester.run("anti-slop/no-unsupported-jsdoc-tag", noUnsupportedJsdocTagRule, {
	valid: [
		"/**\n * @param {string} name\n * @returns {string}\n */\nfunction greet(name) { return name; }",
		"// @enum is mentioned in prose about the old syntax.",
		"/**\n * @typedef {object} Point\n */",
	],
	invalid: [
		{
			code: "/**\n * @enum {string}\n */\nconst Level = {};",
			errors: [
				error("@enum", "use a `@typedef` of string literals with a companion frozen object"),
			],
		},
		{
			code: "/**\n * @constructor\n */\nfunction Point() {}",
			errors: [
				error(
					"@constructor",
					"type the class with a `@typedef` or a TypeScript `class` instead",
				),
			],
		},
	],
});
