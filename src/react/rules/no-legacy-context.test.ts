import { RuleTester } from "oxlint/plugins-dev";

import { noLegacyContextRule } from "./no-legacy-context.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string, replacement: string) => ({
	messageId: "legacyContext",
	data: { name, replacement },
});

tester.run("anti-slop-react/no-legacy-context", noLegacyContextRule, {
	valid: [
		"class Child { static contextType = ThemeContext; }",
		"const config = { contextTypes: {} };",
	],
	invalid: [
		{
			code: "class Child { static contextTypes = { theme: String }; }",
			errors: [
				error("contextTypes", "read a context with `static contextType` and the context object itself"),
			],
		},
		{
			code: "class Parent { getChildContext() { return { theme: \"dark\" }; } }",
			errors: [
				error("getChildContext", "provide a context by rendering its provider component"),
			],
		},
		{
			code: "class Parent { static childContextTypes = { theme: String }; }",
			errors: [
				error("childContextTypes", "provide a context by rendering its provider component"),
			],
		},
	],
});
