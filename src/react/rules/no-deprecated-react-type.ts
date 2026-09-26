import { defineRule } from "@oxlint/plugins";

import { bindingFor, collectImports, type ImportIndex } from "../shared/react-imports.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/**
 * Types `@types/react` marks `@deprecated`.
 *
 * `FormEvent` and `FormEventHandler` have their own rule because agents reach for them
 * constantly; the rest share this list.
 */
const deprecatedTypes = new Set([
	"CElement",
	"ClassicComponent",
	"ClassicComponentClass",
	"ClassicElement",
	"DOMElement",
	"FunctionComponentElement",
	"LegacyRef",
	"MutableRefObject",
	"PropsWithRef",
	"ReactChild",
	"ReactComponentElement",
	"ReactFragment",
	"ReactText",
	"SFC",
	"StatelessComponent",
	"VoidFunctionComponent",
]);

function typeNameParts(node: ESTree.TSTypeReference): readonly string[] | null {
	const name = node.typeName;
	if (name.type === "Identifier") return [name.name];
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
	return parts;
}

/** A bare name is deprecated when it comes from `react`; `React.X` is React's own. */
function isDeprecatedTypeReference(node: ESTree.TSTypeReference, index: ImportIndex): boolean {
	const parts = typeNameParts(node);
	if (parts === null) return false;
	const name = parts[parts.length - 1];
	if (name === undefined || !deprecatedTypes.has(name)) return false;
	if (parts.length > 1) return parts[0] === "React" || parts[0] === "ReactDOM";
	const binding = bindingFor(index, name);
	return binding === null || binding.source === "react";
}

/** Disallow React type names that `@types/react` deprecated or removed. */
export const noDeprecatedReactTypeRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow deprecated React type names (`MutableRefObject`, `LegacyRef`, `PropsWithRef`, `ReactFragment`, `SFC`) including `React.`-qualified uses.",
		},
		messages: {
			deprecatedReactType:
				"`{{name}}` is deprecated in `@types/react`. Use the modern equivalent named in the type's own deprecation note, and drop the import if nothing else uses it.",
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
					messageId: "deprecatedReactType",
					data: { name: parts[parts.length - 1] ?? "deprecated type" },
				});
			},
		};
	},
});
