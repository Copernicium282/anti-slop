import { RuleTester } from "oxlint/plugins-dev";

import { noDeprecatedEventPropertyRule } from "./no-deprecated-event-property.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const replacement = "`event.key` or `event.code`";
const error = (name: string) => ({
	messageId: "deprecatedEventProperty",
	data: { name, replacement },
});

tester.run("anti-slop-react/no-deprecated-event-property", noDeprecatedEventPropertyRule, {
	valid: [
		"const view = <input onKeyDown={event => setKey(event.key)} />;",
		"const codes = { 13: \"enter\" };\nconst match = codes[13];",
		"const view = <div onClick={event => setId(event.detail.which)} />;",
	],
	invalid: [
		{
			code: "const view = <input onKeyDown={event => setKey(event.keyCode)} />;",
			errors: [error("keyCode")],
		},
		{
			code: "element.addEventListener(\"keydown\", event => { setCode(event.which); });",
			errors: [error("which")],
		},
		{
			code: "const view = <input onKeyUp={event => setChar(event.charCode)} />;",
			errors: [error("charCode")],
		},
	],
});
