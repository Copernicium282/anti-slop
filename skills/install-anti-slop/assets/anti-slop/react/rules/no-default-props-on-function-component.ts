import { defineRule } from "@oxlint/plugins";

import { resolveVariable } from "../../shared/scope.ts";
import { isComponentFunction } from "../shared/jsx.ts";

import type { ESTree, Rule, Variable } from "@oxlint/plugins";

/** `Heading.defaultProps = { ... }` on a function component. */
function isDefaultPropsAssignment(node: ESTree.AssignmentExpression): boolean {
	return (
		node.operator === "=" &&
		node.left.type === "MemberExpression" &&
		!node.left.computed &&
		node.left.property.type === "Identifier" &&
		node.left.property.name === "defaultProps" &&
		node.left.object.type === "Identifier"
	);
}

/** `const Heading = () => <h1 />` or `function Heading() { return <h1 /> }`. */
function declaresComponent(variable: Variable | null): boolean {
	if (variable === null) return false;
	return variable.defs.some((definition) => {
		const node = definition.node;
		if (definition.type === "FunctionName") {
			return node.type === "FunctionDeclaration" && isComponentFunction(node);
		}
		if (definition.type !== "Variable" || node.type !== "VariableDeclarator") return false;
		if (node.id.type !== "Identifier" || node.init === null) return false;
		return isComponentFunction(node.init);
	});
}

/** Class components keep `defaultProps` in React 19 because they have no default parameters. */
function isClassComponent(variable: Variable | null): boolean {
	if (variable === null) return false;
	return variable.defs.some((definition) => definition.type === "ClassName");
}

/**
 * Disallow `defaultProps` on function components.
 *
 * React 19 removed `defaultProps` for function components because ES6 default
 * parameters express the same contract. Class components still support it.
 */
export const noDefaultPropsOnFunctionComponentRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `defaultProps` on function components; React 19 removed it in favour of ES6 default parameters.",
		},
		messages: {
			defaultPropsOnFunctionComponent:
				"React 19 removed `defaultProps` for function components. Use a default parameter (`function Heading({ text = \"Hello\" })`) or a default value in the props type.",
		},
	},
	createOnce(context) {
		return {
			AssignmentExpression(node) {
				if (!isDefaultPropsAssignment(node) || node.left.type !== "MemberExpression") return;
				const object = node.left.object;
				if (object.type !== "Identifier") return;
				const variable = resolveVariable(context.sourceCode, object);
				if (!declaresComponent(variable) || isClassComponent(variable)) return;
				context.report({ node, messageId: "defaultPropsOnFunctionComponent" });
			},
		};
	},
});
