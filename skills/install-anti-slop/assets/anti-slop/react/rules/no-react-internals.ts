import { defineRule } from "@oxlint/plugins";

import { collectImports, type ImportIndex } from "../shared/react-imports.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** Members React reserves for itself; React 19 renamed the `__SECRET_INTERNALS` suffix. */
const internals = new Set([
	"__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE",
	"__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE",
	"__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED",
	"__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE",
	"ReactCurrentDispatcher",
	"ReactCurrentOwner",
	"ReactSharedInternals",
]);

const reactModules = new Set(["react", "react-dom", "react-dom/client", "react/jsx-runtime"]);

function internalsName(name: string): string | null {
	if (internals.has(name)) return name;
	return name.startsWith("__SECRET_INTERNALS") || name.startsWith("__CLIENT_INTERNALS")
		? name
		: null;
}

/** Property keys, member names, and import names are not references to an internal. */
function isBindingPosition(node: ESTree.Node): boolean {
	const parent = node.parent;
	if (parent === null) return false;
	if (
		parent.type === "MemberExpression" ||
		parent.type === "Property" ||
		parent.type === "PropertyDefinition" ||
		parent.type === "MethodDefinition"
	) {
		const record = parent as unknown as { key?: unknown; property?: unknown };
		return record.key === node || record.property === node;
	}
	return parent.type === "ImportSpecifier" || parent.type === "ImportDefaultSpecifier";
}

/** Disallow reaching into React internals, which React 19 blocks harder on every release. */
export const noReactInternalsRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow React internals (`__SECRET_INTERNALS_*`, `ReactSharedInternals`, `ReactCurrentDispatcher`), which React 19 blocks harder with every release.",
		},
		messages: {
			reactInternals:
				"`{{name}}` is a React internal. React 19 blocks access to internals more aggressively on every release, so a library built on it breaks without a major bump; use the public API instead.",
		},
	},
	createOnce(context) {
		let index: ImportIndex = { byLocal: new Map() };

		const reportName = (node: ESTree.Node, name: string) => {
			context.report({ node, messageId: "reactInternals", data: { name } });
		};

		return {
			Program(node) {
				index = collectImports(node);
			},
			ImportDeclaration(node) {
				if (!reactModules.has(node.source.value)) return;
				for (const specifier of node.specifiers) {
					const imported =
						specifier.type === "ImportSpecifier"
							? specifier.imported.type === "Identifier"
								? specifier.imported.name
								: specifier.imported.value
							: specifier.type === "ImportNamespaceSpecifier"
								? "*"
								: "default";
					const name = internalsName(imported);
					if (name !== null) reportName(specifier, name);
				}
			},
			MemberExpression(node) {
				if (node.computed || node.property.type !== "Identifier") return;
				const name = internalsName(node.property.name);
				if (name === null) return;
				if (node.object.type === "Identifier") {
					const binding = index.byLocal.get(node.object.name);
					if (binding !== undefined && !reactModules.has(binding.source)) return;
				}
				reportName(node, name);
			},
			Identifier(node) {
				if (node.type !== "Identifier" || isBindingPosition(node)) return;
				const name = internalsName(node.name);
				if (name === null) return;
				reportName(node, name);
			},
		};
	},
});
