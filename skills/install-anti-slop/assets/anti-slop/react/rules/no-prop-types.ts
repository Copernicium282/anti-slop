import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** React 19 ignores `propTypes`; it was already deprecated in React 15.5. */
function isPropTypesMember(node: ESTree.MemberExpression): boolean {
	return !node.computed && node.property.type === "Identifier" && node.property.name === "propTypes";
}

/** `static propTypes = { ... }` or `Foo.propTypes = { ... }`. */
function isPropTypesDefinition(node: ESTree.Node): boolean {
	if (node.type === "PropertyDefinition") {
		return !node.computed && node.key.type === "Identifier" && node.key.name === "propTypes";
	}
	if (node.type === "AssignmentExpression") {
		return node.left.type === "MemberExpression" && isPropTypesMember(node.left);
	}
	return false;
}

/** Disallow `propTypes`, the runtime package, and component `propTypes` definitions. */
export const noPropTypesRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `propTypes`, the `prop-types` package, and `Component.propTypes` definitions, which React 19 ignores.",
		},
		messages: {
			propTypesImport:
				"React 19 ignores `propTypes` at runtime. Describe the props with a TypeScript type (or another static checker) and delete the runtime check.",
			propTypesDefinition:
				"React 19 ignores `propTypes` and removed the check. Declare the props as a TypeScript type on the component instead.",
		},
	},
	createOnce(context) {
		return {
			ImportDeclaration(node) {
				if (node.source.value !== "prop-types") return;
				context.report({ node: node.specifiers[0] ?? node.source, messageId: "propTypesImport" });
			},
			PropertyDefinition(node) {
				if (isPropTypesDefinition(node)) {
					context.report({ node, messageId: "propTypesDefinition" });
				}
			},
			AssignmentExpression(node) {
				if (isPropTypesDefinition(node)) {
					context.report({ node, messageId: "propTypesDefinition" });
				}
			},
		};
	},
});
