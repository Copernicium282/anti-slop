import { defineRule } from "@oxlint/plugins";

import { isUnshadowedGlobal } from "../shared/scope.ts";

import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

/** `Object.prototype.hasOwnProperty.call(target, key)` is the legacy spelling. */
function isPrototypeHasOwnCall(node: ESTree.CallExpression, sourceCode: SourceCode): boolean {
	const callee = node.callee;
	if (callee.type !== "MemberExpression" || callee.computed) return false;
	if (callee.property.type !== "Identifier" || callee.property.name !== "call") return false;
	const owner = callee.object;
	if (owner.type !== "MemberExpression" || owner.computed) return false;
	if (owner.property.type !== "Identifier" || owner.property.name !== "hasOwnProperty") return false;
	if (owner.object.type !== "MemberExpression" || owner.object.computed) return false;
	if (owner.object.object.type !== "Identifier" || owner.object.object.name !== "Object") return false;
	if (owner.object.property.type !== "Identifier" || owner.object.property.name !== "prototype") {
		return false;
	}
	return isUnshadowedGlobal(sourceCode, owner.object.object);
}

/** `target.hasOwnProperty(key)` breaks on null-prototype and overridden objects. */
function isOwnPropertyCall(node: ESTree.CallExpression): boolean {
	const callee = node.callee;
	if (callee.type !== "MemberExpression" || callee.computed) return false;
	return callee.property.type === "Identifier" && callee.property.name === "hasOwnProperty";
}

/** Disallow the legacy `hasOwnProperty` spellings in favour of `Object.hasOwn`. */
export const noLegacyHasOwnPropertyRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `Object.prototype.hasOwnProperty.call` and `value.hasOwnProperty` in favor of `Object.hasOwn`.",
		},
		messages: {
			legacyHasOwnProperty:
				"`hasOwnProperty` is inherited, so it can be shadowed, overridden, or missing on a null-prototype object. Use `Object.hasOwn(target, key)`, which MDN documents as its replacement.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				if (isPrototypeHasOwnCall(node, context.sourceCode) || isOwnPropertyCall(node)) {
					context.report({ node, messageId: "legacyHasOwnProperty" });
				}
			},
		};
	},
});
