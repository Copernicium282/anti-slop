import { defineRule } from "@oxlint/plugins";

import { jsxAttributeName } from "../shared/jsx.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** React 19 removed string refs in favour of ref callbacks and ref objects. */
function isStringRef(attribute: ESTree.JSXAttribute): boolean {
	if (jsxAttributeName(attribute) !== "ref") return false;
	return attribute.value !== null && attribute.value.type === "Literal";
}

/** `this.refs.input` reads the removed string-ref registry. */
function isThisRefs(node: ESTree.MemberExpression): boolean {
	if (node.computed || node.property.type !== "Identifier" || node.property.name !== "refs")
		return false;
	return node.object.type === "ThisExpression";
}

/** Disallow string refs and the `this.refs` registry. */
export const noStringRefsRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow string refs (`ref=\"input\"`) and the removed `this.refs` registry in React components.",
		},
		messages: {
			stringRef:
				"React 19 removed string refs. Use a callback ref (`ref={node => { input = node }}`) or a ref object created with `useRef`.",
			thisRefs:
				"`this.refs` was removed with string refs. Hold the node in an instance field assigned by a ref callback.",
		},
	},
	createOnce(context) {
		return {
			JSXAttribute(node) {
				if (isStringRef(node)) context.report({ node, messageId: "stringRef" });
			},
			MemberExpression(node) {
				if (isThisRefs(node)) context.report({ node, messageId: "thisRefs" });
			},
		};
	},
});
