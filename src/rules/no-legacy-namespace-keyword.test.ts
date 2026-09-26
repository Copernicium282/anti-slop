import { RuleTester } from "oxlint/plugins-dev";

import { noLegacyNamespaceKeywordRule } from "./no-legacy-namespace-keyword.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "legacyNamespaceKeyword" };

tester.run("anti-slop/no-legacy-namespace-keyword", noLegacyNamespaceKeywordRule, {
	valid: [
		"namespace Models {\n\texport interface User {}\n}",
		'declare module "some-module" {\n\texport function load(): void;\n}',
		"declare global {\n\tinterface Window {}\n}",
	],
	invalid: [
		{ code: "module Models {\n\texport const bar = 10;\n}", errors: [error] },
		{ code: "declare module Legacy {\n\texport const value = 1;\n}", errors: [error] },
	],
});
