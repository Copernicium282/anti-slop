import { defineRule } from "@oxlint/plugins";

import { jsxAttributeExpression, jsxAttributeName } from "../shared/jsx.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** Parameter names that read as a positional index. */
const indexNames = new Set(["i", "idx", "index", "key", "position"]);

const listMethods = new Set(["flatMap", "map"]);

/** Second parameter of an enclosing `map` callback, when the callback builds a list. */
function mapIndexParameter(node: ESTree.Node): string | null {
	let current: ESTree.Node | null = node.parent;
	while (current !== null) {
		if (
			(current.type === "ArrowFunctionExpression" || current.type === "FunctionExpression") &&
			current.params.length >= 2
		) {
			const parent = current.parent;
			if (
				parent !== null &&
				parent.type === "CallExpression" &&
				parent.callee.type === "MemberExpression" &&
				!parent.callee.computed &&
				parent.callee.property.type === "Identifier" &&
				listMethods.has(parent.callee.property.name)
			) {
				const parameter = current.params[1];
				return parameter.type === "Identifier" ? parameter.name : null;
			}
			return null;
		}
		current = current.parent;
	}
	return null;
}

/** `key={index}` inside a `map` callback, where the key changes when the list reorders. */
function indexKeyName(node: ESTree.JSXAttribute): string | null {
	if (jsxAttributeName(node) !== "key") return null;
	const expression = jsxAttributeExpression(node);
	if (expression === null || expression.type !== "Identifier") return null;
	const parameter = mapIndexParameter(node);
	if (parameter !== null && expression.name === parameter) return expression.name;
	return indexNames.has(expression.name) ? expression.name : null;
}

/** Disallow array indexes as React keys. */
export const noArrayIndexKeyRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow array indexes as React `key` values; an index key reuses the wrong element when the list reorders.",
		},
		messages: {
			arrayIndexKey:
				"`key={{name}}` reuses an element when the list reorders, so state and DOM nodes follow the position instead of the item. Key by a stable id, or generate one when the item has none.",
		},
	},
	createOnce(context) {
		return {
			JSXAttribute(node) {
				const name = indexKeyName(node);
				if (name === null) return;
				context.report({ node, messageId: "arrayIndexKey", data: { name } });
			},
		};
	},
});
