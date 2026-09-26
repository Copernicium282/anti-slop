import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** The namespace fields this rule reads; the ESTree types leave them loose. */
type ModuleLike = {
	readonly kind?: string;
	readonly global?: boolean;
	readonly id?: { readonly type: string; value?: string } | null;
};

/** `module Foo { }` keeps the legacy keyword; `declare module "pkg" { }` does not. */
function isLegacyModuleKeyword(node: ESTree.Node): boolean {
	const module = node as unknown as ModuleLike;
	if (module.kind !== "module" || module.global === true) return false;
	// A quoted id is the supported external-module form, not a namespace.
	return module.id?.type !== "Literal";
}

/**
 * Disallow the legacy `module` keyword in namespace declarations.
 *
 * TypeScript 6.0 turned this into a hard deprecation and TypeScript 7.0 rejects it,
 * because a module block may become an ECMAScript proposal.
 */
export const noLegacyNamespaceKeywordRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the legacy `module Foo {}` namespace syntax, which TypeScript 6.0 deprecated and TypeScript 7.0 rejects.",
		},
		messages: {
			legacyNamespaceKeyword:
				"TypeScript 7 rejects the `module` keyword in a namespace because an ECMAScript module block may claim the syntax. Write `namespace Foo { ... }`; an ambient `declare module \"pkg\"` stays as it is.",
		},
	},
	createOnce(context) {
		return {
			// A `declare global` wrapper and a namespace share this visitor key.
			TSModuleDeclaration(node) {
				if (isLegacyModuleKeyword(node as ESTree.TSModuleDeclaration)) {
					context.report({ node, messageId: "legacyNamespaceKeyword" });
				}
			},
		};
	},
});
