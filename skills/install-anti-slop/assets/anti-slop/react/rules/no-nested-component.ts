import { defineRule } from "@oxlint/plugins";

import { enclosingFunction, isComponentFunction, isComponentName } from "../shared/jsx.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** `function Row() { return <tr /> }` or `const Row = () => <tr />`. */
function componentName(node: ESTree.Node): string | null {
	if (node.type === "FunctionDeclaration") return node.id?.name ?? null;
	if (node.type === "VariableDeclarator" && node.id.type === "Identifier") return node.id.name;
	return null;
}

/** A declaration nested inside another function is recreated on every render. */
function declaredName(node: ESTree.Node): string | null {
	if (node.type === "FunctionDeclaration") return node.id?.name ?? null;
	if (node.type === "VariableDeclaration" && node.declarations.length === 1) {
		const [declarator] = node.declarations;
		return declarator !== undefined && declarator.id.type === "Identifier" ? declarator.id.name : null;
	}
	return null;
}

/** Disallow components declared inside another component. */
export const noNestedComponentRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow components declared inside another component; a new component type is created on every render, so React remounts its subtree.",
		},
		messages: {
			nestedComponent:
				"`{{name}}` is declared inside another component, so every render creates a new component type and React unmounts and remounts its subtree. Move it to module scope, or render it as a plain function call when it takes no hooks.",
		},
	},
	createOnce(context) {
		const check = (node: ESTree.Node) => {
			const outer = enclosingFunction(node);
			if (outer === null || !isComponentFunction(outer)) return;
			const name = declaredName(node) ?? componentName(node);
			if (name === null || !isComponentName(name)) return;
			context.report({ node, messageId: "nestedComponent", data: { name } });
		};

		return {
			FunctionDeclaration: check,
			VariableDeclaration(node) {
				if (node.parent?.type !== "BlockStatement") return;
				check(node);
			},
		};
	},
});
