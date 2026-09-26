import { RuleTester } from "oxlint/plugins-dev";

import { noAsyncPromiseExecutorRule } from "./no-async-promise-executor.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "asyncPromiseExecutor" };

tester.run("anti-slop/no-async-promise-executor", noAsyncPromiseExecutorRule, {
	valid: [
		"const ready = new Promise((resolve) => { resolve(value); });",
		"const ready = Promise.resolve(value);",
		"const load = () => fetchUser();",
		// A local `Promise` is the target's own implementation, not the global one.
		"const Promise = Deferred;\nconst ready = new Promise(async () => {});",
	],
	invalid: [
		{
			code: "const ready = new Promise(async (resolve) => { resolve(await load()); });",
			errors: [error],
		},
		{
			code: "const ready = new Promise(async function (resolve) { resolve(1); });",
			errors: [error],
		},
	],
});
