import { RuleTester } from "oxlint/plugins-dev";

import { noStringRefsRule } from "./no-string-refs.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });

tester.run("anti-slop-react/no-string-refs", noStringRefsRule, {
	valid: [
		"const view = <input ref={inputRef} />;",
		"const view = <input ref={node => { input = node; }} />;",
		"const refs = createRefs();",
	],
	invalid: [
		{ code: 'const view = <input ref="input" />;', errors: [{ messageId: "stringRef" }] },
		{
			code: "class Input { componentDidMount() { this.refs.input.focus(); } }",
			errors: [{ messageId: "thisRefs" }],
		},
	],
});
