import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

const reducingMethods = new Set(["reduce", "reduceRight"]);

/** `new Map()` or `{}` as the initial accumulator of a grouping reduce. */
function accumulatorInitializer(node: ESTree.CallExpression): ESTree.Node | null {
	const [, initial] = node.arguments;
	if (initial === undefined) return null;
	if (initial.type === "NewExpression" && initial.callee.type === "Identifier") {
		return initial.callee.name === "Map" ? initial : null;
	}
	return initial.type === "ObjectExpression" ? initial : null;
}
function isGroupingBody(node: ESTree.Node | null | undefined): boolean {
	if (node === null || node === undefined) return false;
	if (node.type !== "BlockStatement") return node.type === "ArrowFunctionExpression" && isGroupingBody(node.body);
	let sawAccumulator = false;
	let sawGrouping = false;
	const visit = (child: ESTree.Node | null | undefined): void => {
		if (child === null || child === undefined) return;
		if (Array.isArray(child)) {
			for (const item of child) visit(item as ESTree.Node);
			return;
		}
		if (typeof child !== "object" || !("type" in child)) return;
		const current = child as ESTree.Node;
		if (current.type === "MemberExpression" && !current.computed && current.property.type === "Identifier") {
			if (current.property.name === "get" || current.property.name === "set") sawGrouping = true;
			if (current.property.name === "has") sawGrouping = true;
		}
		if (current.type === "Identifier" && current.name === "groups") sawAccumulator = true;
		for (const [key, value] of Object.entries(current as unknown as Record<string, unknown>)) {
			if (key === "parent" || key === "loc" || key === "range") continue;
			visit(value as ESTree.Node);
		}
	};
	visit(node);
	return sawAccumulator || sawGrouping;
}

/** `items.reduce((groups, item) => { ... }, new Map())` is `Object.groupBy`. */
function groupingReduce(node: ESTree.CallExpression): ESTree.Node | null {
	const callee = node.callee;
	if (callee.type !== "MemberExpression" || callee.computed) return null;
	if (callee.property.type !== "Identifier" || !reducingMethods.has(callee.property.name)) return null;
	const [callback] = node.arguments;
	if (callback === undefined) return null;
	if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") return null;
	if (accumulatorInitializer(node) === null) return null;
	if (!isGroupingBody(callback.body)) return null;
	return callback;
}

/** Disallow hand-rolled grouping reducers in favor of `Object.groupBy` or `Map.groupBy`. */
export const noReduceGroupingRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow hand-rolled grouping reducers in favor of `Object.groupBy` or `Map.groupBy`.",
		},
		messages: {
			reduceGrouping:
				"This reducer groups by a key by hand. `Object.groupBy` (or `Map.groupBy` for a `Map`) is a single pass, is the documented spelling of the pattern, and keeps the grouping out of the callback.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				const callback = groupingReduce(node);
				if (callback === null) return;
				context.report({ node: callback, messageId: "reduceGrouping" });
			},
		};
	},
});
