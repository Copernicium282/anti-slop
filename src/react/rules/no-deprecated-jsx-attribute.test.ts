import { RuleTester } from "oxlint/plugins-dev";

import { noDeprecatedJsxAttributeRule } from "./no-deprecated-jsx-attribute.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string, replacement: string) => ({
	messageId: "deprecatedJsxAttribute",
	data: { name, replacement },
});

tester.run("anti-slop-react/no-deprecated-jsx-attribute", noDeprecatedJsxAttributeRule, {
	valid: [
		"const view = <input onKeyDown={handler} onKeyUp={handler} aria-pressed={true} />;",
		"const view = <script charset=\"utf-8\" />;",
	],
	invalid: [
		{
			code: "const view = <input onKeyPress={handler} />;",
			errors: [
				error(
					"onKeyPress",
					"use `onKeyDown`, which fires for every key the browser delivers",
				),
			],
		},
		{
			code: "const view = <div aria-grabbed={grabbed} />;",
			errors: [
				error(
					"aria-grabbed",
					"it was deprecated in ARIA 1.1; use `aria-pressed` or the drag events instead",
				),
			],
		},
		{
			code: "const view = <div charSet=\"utf-8\" />;",
			errors: [error("charSet", "React wants the lowercase `charset` attribute name")],
		},
		{
			code: "const view = <iframe frameBorder=\"0\" />;",
			errors: [error("frameBorder", "use the `frameBorder` CSS property through `style`")],
		},
		{
			code: "const view = <body marginWidth=\"0\" />;",
			errors: [error("marginWidth", "use the `margin` CSS property through `style`")],
		},
	],
});
