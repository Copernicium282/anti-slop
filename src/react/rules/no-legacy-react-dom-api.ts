import { defineRule } from "@oxlint/plugins";

import { bindingFor, collectImports, importsModule, type ImportIndex } from "../shared/react-imports.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** `react-dom` exports React 19 removed. */
const removedReactDomExports = new Set([
	"createFactory",
	"findDOMNode",
	"hydrate",
	"render",
	"unmountComponentAtNode",
]);

/** Modules React 19 removed or deprecated wholesale. */
const removedModules = new Map([
	["react-dom/test-utils", "import `act` from `react`; the other helpers were removed"],
	["react-test-renderer", "use `@testing-library/react`, which renders like a user does"],
	["react-test-renderer/shallow", "use `@testing-library/react`; shallow rendering depends on React internals"],
]);

/** `ReactDOM.render(...)` where `ReactDOM` is the `react-dom` namespace or default. */
function removedNamespaceCall(
	node: ESTree.CallExpression,
	index: ImportIndex,
): string | null {
	const callee = node.callee;
	if (callee.type !== "MemberExpression" || callee.object.type !== "Identifier") return null;
	const binding = bindingFor(index, callee.object.name);
	if (binding === null || binding.source !== "react-dom") return null;
	if (binding.imported !== "*" && binding.imported !== "default") return null;
	if (callee.computed || callee.property.type !== "Identifier") return null;
	return removedReactDomExports.has(callee.property.name) ? callee.property.name : null;
}

/**
 * Disallow React 19 removals: legacy `react-dom` entry points, `react-dom/test-utils`,
 * and `react-test-renderer`.
 */
export const noLegacyReactDomApiRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow APIs React 19 removed: `ReactDOM.render`, `ReactDOM.hydrate`, `unmountComponentAtNode`, `findDOMNode`, `createFactory`, `react-dom/test-utils`, and `react-test-renderer`.",
		},
		messages: {
			removedReactDomExport:
				"`{{name}}` was removed in React 19. Use `createRoot` and `hydrateRoot` from `react-dom/client`, `root.unmount()`, a DOM ref, or JSX instead.",
			removedModule:
				"`{{module}}` is removed or deprecated in React 19: {{replacement}}.",
		},
	},
	createOnce(context) {
		let index: ImportIndex = { byLocal: new Map() };

		return {
			Program(node) {
				index = collectImports(node);
			},
			ImportDeclaration(node) {
				const source = node.source.value;
				const replacement = removedModules.get(source);
				if (replacement === undefined) return;
				const specifier = node.specifiers[0] ?? node.source;
				context.report({
					node: specifier,
					messageId: "removedModule",
					data: { module: source, replacement },
				});
			},
			ImportSpecifier(node) {
				const declaration = node.parent;
				if (declaration.type !== "ImportDeclaration") return;
				if (declaration.source.value !== "react-dom") return;
				const imported =
					node.imported.type === "Identifier" ? node.imported.name : node.imported.value;
				if (!removedReactDomExports.has(imported)) return;
				context.report({ node, messageId: "removedReactDomExport", data: { name: imported } });
			},
			CallExpression(node) {
				const name = removedNamespaceCall(node, index);
				if (name !== null) {
					context.report({ node, messageId: "removedReactDomExport", data: { name } });
				}
			},
			MemberExpression(node) {
				if (importsModule(index, "react-dom") === false) return;
				if (node.computed || node.property.type !== "Identifier") return;
				if (!removedReactDomExports.has(node.property.name)) return;
				if (node.parent !== null && node.parent.type === "CallExpression") return;
				context.report({
					node,
					messageId: "removedReactDomExport",
					data: { name: node.property.name },
				});
			},
		};
	},
});
