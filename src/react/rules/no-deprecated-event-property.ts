import { defineRule } from "@oxlint/plugins";

import { jsxAttributeExpression, jsxAttributeName } from "../shared/jsx.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** Legacy key codes `@types/react` marks `@deprecated` on `KeyboardEvent`. */
const legacyKeyProperties = new Map([
	["charCode", "`event.key` or `event.code`"],
	["keyCode", "`event.key` or `event.code`"],
	["which", "`event.key` or `event.code`"],
]);

function isEventHandlerAttribute(attribute: ESTree.JSXAttribute): boolean {
	const name = jsxAttributeName(attribute);
	return name !== null && /^on[A-Z]/u.test(name);
}

/** An event handler is a JSX prop or an `addEventListener` callback. */
function isEventHandlerFunction(node: ESTree.Node): boolean {
	const parent = node.parent;
	if (parent === null) return false;
	if (parent.type === "JSXExpressionContainer") {
		const attribute = parent.parent;
		return (
			attribute !== null &&
			attribute.type === "JSXAttribute" &&
			isEventHandlerAttribute(attribute) &&
			jsxAttributeExpression(attribute) === node
		);
	}
	if (parent.type === "CallExpression") {
		const callee = parent.callee;
		return (
			callee.type === "MemberExpression" &&
			!callee.computed &&
			callee.property.type === "Identifier" &&
			callee.property.name === "addEventListener" &&
			parent.arguments.includes(node as never)
		);
	}
	return false;
}

/** The deprecated properties are only deprecated when read off the event itself. */
function readsEventParameter(node: ESTree.MemberExpression, handler: ESTree.Node): boolean {
	const parameter = (handler as { params?: readonly ESTree.Node[] }).params?.[0];
	if (parameter === undefined || parameter.type !== "Identifier") return false;
	return node.object.type === "Identifier" && node.object.name === parameter.name;
}

/** Disallow `keyCode`, `charCode`, and `which` reads in event handlers. */
export const noDeprecatedEventPropertyRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the deprecated `keyCode`, `charCode`, and `which` properties on React keyboard events.",
		},
		messages: {
			deprecatedEventProperty:
				"`{{name}}` is deprecated on React keyboard events and misses characters the browser delivers. Use {{replacement}} and compare the key value.",
		},
	},
	createOnce(context) {
		return {
			MemberExpression(node) {
				if (node.computed || node.property.type !== "Identifier") return;
				const replacement = legacyKeyProperties.get(node.property.name);
				if (replacement === undefined) return;
				// Only event handlers are deprecated; a map keyed by a numeric code is fine.
				let current: ESTree.Node | null = node.parent;
				while (current !== null) {
					if (
						current.type === "ArrowFunctionExpression" ||
						current.type === "FunctionExpression" ||
						current.type === "FunctionDeclaration"
					) {
						if (!isEventHandlerFunction(current) || !readsEventParameter(node, current)) return;
						break;
					}
					current = current.parent;
				}
				if (current === null) return;
				context.report({
					node,
					messageId: "deprecatedEventProperty",
					data: { name: node.property.name, replacement },
				});
			},
		};
	},
});
