import { RuleTester } from "oxlint/plugins-dev";

import { noStringExecutionRule } from "./no-string-execution.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (name: string) => ({ messageId: "stringExecution", data: { name } });

tester.run("anti-slop/no-string-execution", noStringExecutionRule, {
	valid: [
		// A local binding named `eval` is the target's own function.
		"const eval = transform;\nconst value = eval(expression);",
		"const Function = Factory;\nconst make = new Function();",
		'setTimeout(() => { render(); }, 50);',
		"setInterval(tick, 100);",
		'const text = "eval(\\"x\\")";',
	],
	invalid: [
		{ code: 'const value = eval("1 + 1");', errors: [error("eval")] },
		{ code: 'const make = new Function("a", "return a * 2");', errors: [error("new Function")] },
		{ code: 'setTimeout("render()", 50);', errors: [error('setTimeout("render()", ...)')] },
		{ code: 'window.setTimeout("render()", 50);', errors: [error('window.setTimeout("render()", ...)')] },
	],
});
