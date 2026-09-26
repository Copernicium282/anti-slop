import { defineRule } from "@oxlint/plugins";

import type { ESTree, Rule } from "@oxlint/plugins";

/** The parts of a namespace this rule inspects; the ESTree types leave them loose. */
type NamespaceLike = {
	readonly type: string;
	readonly global?: boolean;
	readonly parent?: NamespaceLike | null;
	readonly body?: { readonly type: string; readonly body?: readonly JsxLike[] } | null;
};

type JsxLike = {
	readonly type: string;
	readonly id?: { readonly type: string; readonly name?: string } | null;
};

function asNamespace(node: unknown): NamespaceLike | null {
	return node === null || node === undefined ? null : (node as NamespaceLike);
}

function isJsxNamespace(node: JsxLike): boolean {
	return (
		node.type === "TSModuleDeclaration" &&
		node.id !== null &&
		node.id !== undefined &&
		node.id.type === "Identifier" &&
		node.id.name === "JSX"
	);
}

/** `declare global { namespace JSX { ... } }`, including the bare `namespace JSX` form. */
function isGlobalJsxNamespace(node: ESTree.TSModuleDeclaration | ESTree.TSGlobalDeclaration): boolean {
	const id = (node as { readonly id?: { readonly type: string; readonly name?: string } }).id;
	if (id === undefined || id.type !== "Identifier" || id.name !== "JSX") return false;
	// A nested namespace sits inside a module block, whose parent is the global wrapper.
	const parent = asNamespace((node as { readonly parent?: unknown }).parent);
	if (parent?.global === true) return true;
	return asNamespace(parent?.parent)?.global === true;
}

/** React 19 removed the global `JSX` namespace in favour of `React.JSX`. */
export const noGlobalJsxNamespaceRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the global `JSX` namespace; React 19 requires module augmentation through `declare module \"react\"`.",
		},
		messages: {
			globalJsxNamespace:
				"React 19 removed the global `JSX` namespace because it polluted the global scope and collided with other JSX libraries. Augment it inside `declare module \"react\" { namespace JSX { ... } }` (or the JSX runtime specifier your `jsx` option names).",
		},
	},
	createOnce(context) {
		return {
			// A `declare global` wrapper and a namespace share this visitor key.
			TSModuleDeclaration(node) {
				if (isGlobalJsxNamespace(node as ESTree.TSModuleDeclaration)) {
					context.report({ node, messageId: "globalJsxNamespace" });
				}
			},
			TSGlobalDeclaration(node) {
				if (isGlobalJsxNamespace(node as ESTree.TSGlobalDeclaration)) return;
				const namespace = asNamespace(node);
				const body = namespace?.body;
				if (body === null || body === undefined || body.type !== "TSModuleBlock") return;
				if (!(body.body ?? []).some(isJsxNamespace)) return;
				context.report({ node, messageId: "globalJsxNamespace" });
			},
		};
	},
});
