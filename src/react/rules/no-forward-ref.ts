import { defineRule } from "@oxlint/plugins";

import { collectImports, isNamedImport, type ImportIndex } from "../shared/react-imports.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/**
 * Disallow `forwardRef`, since React 19 accepts `ref` as a prop on function components.
 *
 * A call is reported where it is used. An import that is never called is reported at the
 * end of the file, so a re-export is not flagged twice.
 */
export const noForwardRefRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `forwardRef`; React 19 passes `ref` as an ordinary prop to function components, so the wrapper is no longer needed.",
		},
		messages: {
			forwardRef:
				"React 19 passes `ref` as a regular prop, so `forwardRef` adds a wrapper with no benefit. Accept `ref` in the props type and use it directly; keep the wrapper only while the library still supports React 18.",
		},
	},
	createOnce(context) {
		let index: ImportIndex = { byLocal: new Map() };
		let imported: ESTree.ImportSpecifier | null = null;
		const called = new Set<string>();

		return {
			Program(node) {
				index = collectImports(node);
			},
			"Program:exit"() {
				if (imported === null || called.has(imported.local.name)) return;
				context.report({ node: imported, messageId: "forwardRef" });
			},
			ImportSpecifier(node) {
				const declaration = node.parent;
				if (declaration.type !== "ImportDeclaration") return;
				if (declaration.source.value !== "react") return;
				const name =
					node.imported.type === "Identifier" ? node.imported.name : node.imported.value;
				if (name !== "forwardRef") return;
				imported = node;
			},
			CallExpression(node) {
				if (node.callee.type !== "Identifier") return;
				if (!isNamedImport(index, node.callee.name, "forwardRef", "react")) return;
				called.add(node.callee.name);
				context.report({ node, messageId: "forwardRef" });
			},
		};
	},
});
