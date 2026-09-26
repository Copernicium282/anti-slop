import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

/** Resolve an identifier to its binding by walking lexical scopes upward. */
export function resolveVariable(
	sourceCode: SourceCode,
	identifier: ESTree.IdentifierReference,
): Variable | null {
	let scope: Scope | null = sourceCode.getScope(identifier);
	while (scope !== null) {
		const variable = scope.set.get(identifier.name);
		if (variable !== undefined) return variable;
		scope = scope.upper;
	}
	return null;
}

/**
 * Return whether a name comes from the global scope rather than a local declaration.
 *
 * A global binding exists in the global scope but carries no definition, so a shadowing
 * declaration is what matters. `SourceCode.isGlobalReference` is not used because it
 * depends on the configured globals, which the test harness does not set.
 */
export function isUnshadowedGlobal(
	sourceCode: SourceCode,
	identifier: ESTree.IdentifierReference,
): boolean {
	const variable = resolveVariable(sourceCode, identifier);
	return variable === null || variable.defs.length === 0;
}
