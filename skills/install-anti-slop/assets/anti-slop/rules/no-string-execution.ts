import { defineRule } from "@oxlint/plugins";

import { isUnshadowedGlobal } from "../shared/scope.ts";

import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

/** Timer functions that accept a string body instead of a function. */
const stringTimers = new Set(["setInterval", "setTimeout"]);

/** `eval("...")`, called as a global. */
function globalEval(node: ESTree.CallExpression, sourceCode: SourceCode): boolean {
	return (
		node.callee.type === "Identifier" &&
		node.callee.name === "eval" &&
		isUnshadowedGlobal(sourceCode, node.callee)
	);
}

/** `setTimeout("render()", 0)` runs code from a string. */
function stringTimerCall(node: ESTree.CallExpression): string | null {
	const [first] = node.arguments;
	if (first === undefined || first.type !== "Literal" || typeof first.value !== "string") {
		return null;
	}
	const callee = node.callee;
	let timer: string | null = null;
	if (callee.type === "Identifier" && stringTimers.has(callee.name)) {
		timer = callee.name;
	} else if (
		callee.type === "MemberExpression" &&
		!callee.computed &&
		callee.object.type === "Identifier" &&
		callee.property.type === "Identifier" &&
		stringTimers.has(callee.property.name)
	) {
		// `setTimeout(...)` and `window.setTimeout(...)` are the same global call.
		timer = `${callee.object.name}.${callee.property.name}`;
	}
	return timer === null ? null : `${timer}("${first.value}", ...)`;
}

/** `new Function("a", "return a")` builds a function from a string. */
function dynamicFunction(node: ESTree.NewExpression, sourceCode: SourceCode): boolean {
	return (
		node.callee.type === "Identifier" &&
		node.callee.name === "Function" &&
		isUnshadowedGlobal(sourceCode, node.callee)
	);
}

/** Disallow executing code from a string. */
export const noStringExecutionRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `eval`, `new Function`, and string callbacks to `setTimeout`/`setInterval` in favor of real functions.",
		},
		messages: {
			stringExecution:
				"`{{name}}` runs code from a string, so nothing in it is type-checked, bundled, or greppable. Call a real function instead; a factory call or a module boundary expresses the same thing.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				if (globalEval(node, context.sourceCode)) {
					context.report({ node, messageId: "stringExecution", data: { name: "eval" } });
					return;
				}
				const timer = stringTimerCall(node);
				if (timer !== null) {
					context.report({ node, messageId: "stringExecution", data: { name: timer } });
				}
			},
			NewExpression(node) {
				if (!dynamicFunction(node, context.sourceCode)) return;
				context.report({ node, messageId: "stringExecution", data: { name: "new Function" } });
			},
		};
	},
});
