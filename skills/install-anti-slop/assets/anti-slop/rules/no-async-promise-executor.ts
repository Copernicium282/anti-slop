import { defineRule } from "@oxlint/plugins";

import { isUnshadowedGlobal } from "../shared/scope.ts";

import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

const promiseConstructors = new Set(["Promise"]);

/** `new Promise(async (resolve) => ...)` loses the executor's rejection handling. */
function asyncPromiseExecutor(
	node: ESTree.NewExpression,
	sourceCode: SourceCode,
): ESTree.Node | null {
	const callee = node.callee;
	const isPromise =
		(callee.type === "Identifier" &&
			promiseConstructors.has(callee.name) &&
			isUnshadowedGlobal(sourceCode, callee)) ||
		(callee.type === "MemberExpression" &&
			!callee.computed &&
			callee.object.type === "Identifier" &&
			callee.object.name === "Promise" &&
			callee.property.type === "Identifier" &&
			callee.property.name === "Promise");
	if (!isPromise) return null;
	const [executor] = node.arguments;
	if (executor === undefined) return null;
	if (executor.type !== "ArrowFunctionExpression" && executor.type !== "FunctionExpression") {
		return null;
	}
	return executor.async ? executor : null;
}

/** Disallow an `async` function as a `Promise` executor. */
export const noAsyncPromiseExecutorRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow an `async` function passed as a `Promise` executor; a throw after the first `await` never rejects the promise.",
		},
		messages: {
			asyncPromiseExecutor:
				"A `Promise` executor ignores its return value and only catches throws that happen before the first `await`, so a later rejection is lost and the promise stays pending. Run the async work outside the executor and return the promise, or wire the failure into `reject`.",
		},
	},
	createOnce(context) {
		const check = (node: ESTree.NewExpression) => {
			const executor = asyncPromiseExecutor(node, context.sourceCode);
			if (executor === null) return;
			context.report({ node: executor, messageId: "asyncPromiseExecutor" });
		};

		return { NewExpression: check };
	},
});
