import { RuleTester } from "oxlint/plugins-dev";

import { noImplicitRefCallbackReturnRule } from "./no-implicit-ref-callback-return.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "implicitRefCallbackReturn" };

tester.run("anti-slop-react/no-implicit-ref-callback-return", noImplicitRefCallbackReturnRule, {
	valid: [
		"let input: HTMLInputElement | null = null;\nconst view = <input ref={node => { input = node; }} />;",
		"let node: unknown;\nconst view = <input ref={element => () => { node = element; }} />;",
		"const view = <input ref={inputRef} />;",
	],
	invalid: [
		{ code: "let input: unknown;\nconst view = <input ref={node => (input = node)} />;", errors: [error] },
		{ code: "let input: unknown;\nconst view = <div ref={node => (input = node)} />;", errors: [error] },
	],
});
