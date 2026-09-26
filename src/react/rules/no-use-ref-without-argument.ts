import { defineRule } from "@oxlint/plugins";

import { collectImports, isNamedImport, type ImportIndex } from "../shared/react-imports.ts";

import type { Rule } from "@oxlint/plugins";

/** Disallow `useRef()` with no argument, which no longer type-checks in React 19. */
export const noUseRefWithoutArgumentRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `useRef()` with no argument; React 19 requires one, since every ref is now mutable.",
		},
		messages: {
			useRefWithoutArgument:
				"`useRef` requires an argument in React 19 and every ref is mutable. Pass the initial value (`useRef<HTMLDivElement | null>(null)`) so the ref's type states what it holds.",
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
				if (!isNamedImport(index, node.callee.name, "useRef", "react")) return;
				if (node.arguments.length > 0) return;
				context.report({ node, messageId: "useRefWithoutArgument" });
			},
		};
	},
});
