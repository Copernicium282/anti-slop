import type { ESTree } from "@oxlint/plugins";

/** JSX and component helpers shared by the React rules. */

const componentFunctions = new Set([
	"ArrowFunctionExpression",
	"FunctionDeclaration",
	"FunctionExpression",
]);

/** Name of a JSX attribute, whether it is written `ref` or `xlink:href`. */
export function jsxAttributeName(attribute: ESTree.JSXAttribute): string | null {
	const name = attribute.name;
	if (name.type === "JSXIdentifier") return name.name;
	if (name.type === "JSXNamespacedName") {
		return name.namespace.type === "JSXIdentifier" && name.name.type === "JSXIdentifier"
			? `${name.namespace.name}:${name.name.name}`
			: null;
	}
	return null;
}

/** Expression held by a JSX attribute, unwrapping `{...}` containers. */
export function jsxAttributeExpression(
	attribute: ESTree.JSXAttribute,
): ESTree.JSXExpressionContainer["expression"] | null {
	const value = attribute.value;
	if (value === null || value.type !== "JSXExpressionContainer") return null;
	return value.expression;
}

/** Return whether a function body returns JSX, which is what makes it a component. */
export function returnsJsx(node: ESTree.Node): boolean {
	if (!("body" in node) || node.body === null || node.body === undefined) return false;
	const body = node.body as ESTree.Node;
	if (body.type === "JSXElement" || body.type === "JSXFragment") return true;
	if (body.type !== "BlockStatement") return false;
	return body.body.some(
		(statement) =>
			statement.type === "ReturnStatement" &&
			statement.argument !== null &&
			(statement.argument.type === "JSXElement" || statement.argument.type === "JSXFragment"),
	);
}

/** Return whether a node is a function that could be a React component. */
export function isComponentFunction(node: ESTree.Node): boolean {
	return componentFunctions.has(node.type) && returnsJsx(node);
}

/** Nearest enclosing function, or `null` at the top level. */
export function enclosingFunction(node: ESTree.Node): ESTree.Node | null {
	let current: ESTree.Node | null = node.parent;
	while (current !== null) {
		if (componentFunctions.has(current.type)) return current;
		current = current.parent;
	}
	return null;
}

/** Capitalized names are treated as components, matching React's own convention. */
export function isComponentName(name: string): boolean {
	return /^\p{Lu}/u.test(name);
}
