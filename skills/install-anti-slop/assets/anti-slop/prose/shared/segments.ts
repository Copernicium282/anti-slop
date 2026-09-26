import type { Context, ESTree, Location, Ranged, SourceCode } from "@oxlint/plugins";

/** One prose surface: a comment, or a string literal when a rule opts in. */
export type ProseSegment = {
	/** Node reported when a rule reports the whole segment. */
	readonly node: Ranged;
	/** Raw comment value or string value, with delimiters already removed. */
	readonly raw: string;
	/** Raw text split on line boundaries. */
	readonly lines: readonly string[];
	/** Map a slice of `raw` back to a source location. */
	readonly locAt: (offset: number, length: number) => Location;
};

/** Rule options shared by every prose rule. */
export type ProseScope = {
	readonly includeStrings: boolean;
};

/** Comment delimiters are always two characters, so the value starts two characters in. */
const commentValueOffset = 2;

/** Prose needs letters and whitespace; a single token is data, not a sentence. */
const proseShape = /\p{L}/u;
const proseWhitespace = /\s/u;

function optionObject(context: Context): Record<string, unknown> | null {
	const option = context.options?.[0];
	if (typeof option !== "object" || option === null || Array.isArray(option)) return null;
	return option as Record<string, unknown>;
}

/** Read `{ includeStrings }`; comments are the only prose surface by default. */
export function proseScope(context: Context): ProseScope {
	return { includeStrings: optionObject(context)?.includeStrings === true };
}

/** Read a positive integer option, falling back to the rule's own default. */
export function proseCountOption(context: Context, name: string, fallback: number): number {
	const value = optionObject(context)?.[name];
	return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}

/** Read a non-negative integer option such as a dash budget. */
export function proseNumberOption(context: Context, name: string, fallback: number): number {
	const value = optionObject(context)?.[name];
	return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : fallback;
}

/** Read a list-of-strings option such as extra vocabulary. */
export function proseStringListOption(context: Context, name: string): readonly string[] | null {
	const value = optionObject(context)?.[name];
	if (!Array.isArray(value)) return null;
	const entries = value.flatMap((entry) =>
		typeof entry === "string" && entry.trim().length > 0 ? [entry.trim()] : [],
	);
	return entries.length > 0 ? entries : null;
}

function commentSegment(sourceCode: SourceCode, comment: ESTree.Comment): ProseSegment {
	const base = comment.start + commentValueOffset;
	return {
		node: comment,
		raw: comment.value,
		lines: comment.value.split(/\r?\n/u),
		locAt: (offset, length) => ({
			start: sourceCode.getLocFromIndex(base + offset),
			end: sourceCode.getLocFromIndex(base + offset + length),
		}),
	};
}

/** Collect every comment in the file as a prose surface, in source order. */
export function proseCommentSegments(context: Context): readonly ProseSegment[] {
	return context.sourceCode
		.getAllComments()
		.filter((comment) => comment.type !== "Shebang")
		.map((comment) => commentSegment(context.sourceCode, comment));
}

function isStringLiteral(node: ESTree.Node): node is ESTree.StringLiteral {
	return node.type === "Literal" && typeof node.value === "string";
}

/** Module specifiers, import attributes, and directives are data, not prose. */
function isDataString(node: ESTree.StringLiteral): boolean {
	const parent = node.parent;
	if (parent === null) return true;
	if (parent.type === "ImportExpression" && parent.source === node) return true;
	if (parent.type === "ImportAttribute") return true;
	if (parent.type === "TSExternalModuleReference") return true;
	// A literal directly under a module declaration is its specifier.
	if (
		parent.type === "ImportDeclaration" ||
		parent.type === "ExportNamedDeclaration" ||
		parent.type === "ExportAllDeclaration"
	) {
		return true;
	}
	// A directive prologue holds mode strings, not prose.
	return parent.type === "ExpressionStatement" && parent.directive !== null;
}

/** Treat a string literal as prose when it reads like a sentence rather than data. */
export function proseStringSegment(context: Context, node: ESTree.Node): ProseSegment | null {
	if (!isStringLiteral(node)) return null;
	if (!proseShape.test(node.value) || !proseWhitespace.test(node.value)) return null;
	if (isDataString(node)) return null;
	return {
		node,
		raw: node.value,
		lines: node.value.split(/\r?\n/u),
		// Escape sequences shift value offsets, so a string is reported as a whole.
		locAt: () => ({
			start: context.sourceCode.getLocFromIndex(node.start),
			end: context.sourceCode.getLocFromIndex(node.end),
		}),
	};
}
