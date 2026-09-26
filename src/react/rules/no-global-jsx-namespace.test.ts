import { RuleTester } from "oxlint/plugins-dev";

import { noGlobalJsxNamespaceRule } from "./no-global-jsx-namespace.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "globalJsxNamespace" };

tester.run("anti-slop-react/no-global-jsx-namespace", noGlobalJsxNamespaceRule, {
	valid: [
		'declare module "react" { namespace JSX { interface IntrinsicElements { "my-tag": {} } } }',
		"namespace Models { export interface User {} }",
	],
	invalid: [
		{
			code: 'declare global { namespace JSX { interface IntrinsicElements { "my-tag": {} } } }',
			errors: [error],
		},
		{ code: "declare global { namespace JSX { interface Element {} } }", errors: [error] },
	],
});
