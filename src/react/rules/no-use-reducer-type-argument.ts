import { defineRule } from "@oxlint/plugins";

import { collectImports, isNamedImport, type ImportIndex } from "../shared/react-imports.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** The first type argument of `useReducer`, when it names a reducer type. */
function reducerTypeArgument(node: ESTree.CallExpression): ESTree.TSType | null {
	if (node.callee.type !== "Identifier") return null;
	const typeArguments = node.typeArguments;
	if (typeArguments === null || typeArguments === undefined) return null;
	const [first] = typeArguments.params;
	if (first === undefined || first.type !== "TSTypeReference") return null;
	const name = first.typeName;
	if (name.type === "Identifier") return name.name === "Reducer" ? first : null;
	if (name.type !== "TSQualifiedName") return null;
	const parts: string[] = [];
	let current: ESTree.TSTypeName = name;
	while (current.type === "TSQualifiedName") {
		if (current.right.type !== "Identifier") return null;
		parts.unshift(current.right.name);
		current = current.left;
	}
	if (current.type !== "Identifier") return null;
	parts.unshift(current.name);
	return parts[parts.length - 1] === "Reducer" ? first : null;
}

/**
 * Disallow passing the whole reducer type to `useReducer`.
 *
 * React 19 improved `useReducer` inference, and the reducer type is no longer a valid
 * single type argument. Annotate the reducer's parameters instead.
 */
export const noUseReducerTypeArgumentRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `useReducer<Reducer<State, Action>>(reducer)`; React 19 no longer accepts the reducer type as a single type argument.",
		},
		messages: {
			useReducerTypeArgument:
				"`useReducer` no longer takes the whole reducer type as one type argument. Annotate the reducer's parameters (`useReducer((state: State, action: Action) => state)`), or pass `useReducer<State, [Action]>(reducer)` when the reducer is defined elsewhere.",
		},
	},
	createOnce(context) {
		let index: ImportIndex = { byLocal: new Map() };

		return {
			Program(node) {
				index = collectImports(node);
			},
			CallExpression(node) {
				if (node.callee.type !== "Identifier") return;
				if (!isNamedImport(index, node.callee.name, "useReducer", "react")) return;
				const typeArgument = reducerTypeArgument(node);
				if (typeArgument === null) return;
				context.report({ node: typeArgument, messageId: "useReducerTypeArgument" });
			},
		};
	},
});
