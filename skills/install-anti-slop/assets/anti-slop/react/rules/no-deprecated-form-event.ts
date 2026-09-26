import { defineRule } from "@oxlint/plugins";

import { bindingFor, collectImports, type ImportIndex } from "../shared/react-imports.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** Types `@types/react` marks `@deprecated`. */
const deprecatedTypes = new Set([
	"FormEvent",
	"FormEventHandler",
]);

/** A type name used as `FormEvent` or `React.FormEvent`. */
function typeNameParts(node: ESTree.TSType): readonly string[] | null {
	if (node.type === "TSTypeReference") {
		const name = node.typeName;
		if (name.type === "Identifier") return [name.name];
		if (name.type === "TSQualifiedName") {
			const parts: string[] = [];
			let current: ESTree.TSTypeName = name;
			while (current.type === "TSQualifiedName") {
				if (current.right.type !== "Identifier") return null;
				parts.unshift(current.right.name);
				current = current.left;
			}
			if (current.type !== "Identifier") return null;
			parts.unshift(current.name);
			return parts;
		}
		return null;
	}
	return null;
}

/** A bare type name is deprecated when `react` exports it; `X.FormEvent` is React's own. */
function isDeprecatedTypeReference(node: ESTree.TSTypeReference, index: ImportIndex): boolean {
	const parts = typeNameParts(node);
	if (parts === null) return false;
	const name = parts[parts.length - 1];
	if (name === undefined || !deprecatedTypes.has(name)) return false;
	if (parts.length > 1) return parts[0] === "React" || parts[0] === "ReactDOM";
	const binding = bindingFor(index, name);
	return binding === null || binding.source === "react";
}

/**
 * Disallow the deprecated `FormEvent` and `FormEventHandler` types.
 *
 * `@types/react` deprecates them because no DOM event is a plain form event: use the
 * type that matches the element (`ChangeEvent`, `InputEvent`, `SubmitEvent`) or
 * `SyntheticEvent`.
 */
export const noDeprecatedFormEventRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the deprecated `FormEvent` and `FormEventHandler` types in favor of `ChangeEvent`, `InputEvent`, `SubmitEvent`, or `SyntheticEvent`.",
		},
		messages: {
			deprecatedFormEvent:
				"`{{name}}` is deprecated because no DOM event is a plain form event. Use `ChangeEvent`, `InputEvent`, `SubmitEvent`, or `SyntheticEvent` for the element that actually fires it.",
		},
	},
	createOnce(context) {
		let index: ImportIndex = { byLocal: new Map() };

		return {
			Program(node) {
				index = collectImports(node);
			},
			TSTypeReference(node) {
				if (!isDeprecatedTypeReference(node, index)) return;
				const parts = typeNameParts(node) ?? [];
				context.report({
					node,
					messageId: "deprecatedFormEvent",
					data: { name: parts[parts.length - 1] ?? "FormEvent" },
				});
			},
		};
	},
});
