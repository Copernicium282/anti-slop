import { defineRule } from "@oxlint/plugins";

import { jsxAttributeExpression, jsxAttributeName } from "../shared/jsx.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** `<div ref={node => (input = node)} />` returns the assigned value. */
function implicitReturnBody(node: ESTree.Node): boolean {
	if (node.type !== "ArrowFunctionExpression" && node.type !== "FunctionExpression") return false;
	if (node.expression !== true) return false;
	const body = node.body;
	// A returned function is React 19's ref cleanup form, which is the documented way to write one.
	return body.type !== "ArrowFunctionExpression" && body.type !== "FunctionExpression";
}

/** Disallow a ref callback that returns a value, which React 19 reads as a cleanup function. */
export const noImplicitRefCallbackReturnRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow implicit returns from ref callbacks; React 19 treats a returned function as a ref cleanup and rejects anything else.",
		},
		messages: {
			implicitRefCallbackReturn:
				"This ref callback returns a value, which React 19 reads as a cleanup function. Use a block body (`ref={node => { input = node; }}`), or return a function only when the ref really cleans up.",
		},
	},
	createOnce(context) {
		return {
			JSXAttribute(node) {
				if (jsxAttributeName(node) !== "ref") return;
				const expression = jsxAttributeExpression(node);
				if (expression === null || !implicitReturnBody(expression)) return;
				context.report({ node, messageId: "implicitRefCallbackReturn" });
			},
		};
	},
});
