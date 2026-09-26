import type { ESTree } from "@oxlint/plugins";

/** Where a local binding came from, so rules can check the real module behind a name. */
export type ImportBinding = {
	readonly source: string;
	/** `"*"` for a namespace import, `"default"` for a default import, else the imported name. */
	readonly imported: string;
};

export type ImportIndex = {
	readonly byLocal: ReadonlyMap<string, ImportBinding>;
};

function importedName(specifier: ESTree.ImportSpecifier): string {
	return specifier.imported.type === "Identifier" ? specifier.imported.name : specifier.imported.value;
}

/**
 * Index the module bindings of one file.
 *
 * Only static top-level imports are indexed. Dynamic `import()` calls, `require`, and
 * re-exports are deliberately out of scope so a rule never guesses a module's identity.
 */
export function collectImports(program: ESTree.Program): ImportIndex {
	const byLocal = new Map<string, ImportBinding>();
	for (const statement of program.body) {
		if (statement.type !== "ImportDeclaration") continue;
		const source = statement.source.value;
		for (const specifier of statement.specifiers) {
			if (specifier.type === "ImportDefaultSpecifier") {
				byLocal.set(specifier.local.name, { source, imported: "default" });
			} else if (specifier.type === "ImportNamespaceSpecifier") {
				byLocal.set(specifier.local.name, { source, imported: "*" });
			} else {
				byLocal.set(specifier.local.name, { source, imported: importedName(specifier) });
			}
		}
	}
	return { byLocal };
}

export function bindingFor(index: ImportIndex, name: string): ImportBinding | null {
	return index.byLocal.get(name) ?? null;
}

/** Return whether a local name is a named import of `module`, e.g. `useState` from `react`. */
export function isNamedImport(index: ImportIndex, name: string, imported: string, module: string): boolean {
	const binding = bindingFor(index, name);
	return binding !== null && binding.source === module && binding.imported === imported;
}

/** Return whether a local name is the namespace or default binding of `module`. */
export function isNamespaceImport(index: ImportIndex, name: string, module: string): boolean {
	const binding = bindingFor(index, name);
	return binding !== null && binding.source === module && binding.imported === "*";
}

/** Return whether any local name in the file is bound to `module`. */
export function importsModule(index: ImportIndex, module: string): boolean {
	for (const binding of index.byLocal.values()) {
		if (binding.source === module) return true;
	}
	return false;
}
