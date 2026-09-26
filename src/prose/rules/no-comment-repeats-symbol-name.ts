import { defineRule } from "@oxlint/plugins";

import { splitSentences, openingWord, words } from "../shared/sentences.ts";

import type { ESTree, Rule } from "@oxlint/plugins";

/** Humanizer §24: a heading followed by a line that repeats it. */

const exportWrappers = new Set(["ExportDefaultDeclaration", "ExportNamedDeclaration"]);

/** `parseUser`, `parse_user`, and `Parse User` all start with the same segment. */
function nameSegments(name: string): readonly string[] {
	return name.split(/[^\p{L}\p{N}]+|(?=\p{Lu})/u).filter((segment) => segment.length > 0);
}

function normalizedName(name: string): string {
	return name.toLowerCase().replaceAll(/[^\p{L}\p{N}]+/gu, "");
}

function declarationName(node: ESTree.Node): string | null {
	switch (node.type) {
		case "ClassDeclaration":
		case "FunctionDeclaration":
			return node.id?.name ?? null;
		case "MethodDefinition":
		case "PropertyDefinition":
			return node.key.type === "Identifier" ? node.key.name : null;
		case "TSEnumDeclaration":
		case "TSInterfaceDeclaration":
		case "TSTypeAliasDeclaration":
			return node.id.name;
		case "VariableDeclaration":
			return node.declarations[0]?.id.type === "Identifier" ? node.declarations[0].id.name : null;
		default:
			return null;
	}
}

/**
 * A documentation comment that opens with the symbol's own name repeats the heading
 * before the content starts.
 */
function repeatsName(comment: string, name: string, maxWords: number): boolean {
	const [sentence] = splitSentences(comment);
	if (sentence === undefined) return false;
	const sentenceWords = words(sentence);
	if (sentenceWords.length > maxWords) return false;
	const first = openingWord(sentence);
	if (first === null || first.length < 3) return false;
	const [head] = nameSegments(name);
	if (head === undefined || head.toLowerCase() !== first) return false;
	return normalizedName(name).startsWith(first);
}

function configuredMaxWords(context: { readonly options?: unknown } | null): number {
	const option = (context?.options as readonly unknown[] | undefined)?.[0];
	const value =
		typeof option === "object" && option !== null && !Array.isArray(option)
			? (option as Record<string, unknown>).maxWords
			: undefined;
	return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : 5;
}

/** Disallow documentation comments whose first sentence restates the documented name. */
export const noCommentRepeatsSymbolNameRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow a documentation comment whose first sentence restates the name of the symbol it documents.",
		},
		messages: {
			repeatedSymbolName:
				'This comment opens by repeating "{{name}}". The name already says what the symbol is; start with what it does or what the caller needs to know.',
		},
		schema: [
			{
				type: "object",
				properties: { maxWords: { type: "integer", minimum: 1 } },
				additionalProperties: false,
			},
		],
		defaultOptions: [{ maxWords: 5 }],
	},
	createOnce(context) {
		const check = (node: ESTree.Node) => {
			const name = declarationName(node);
			if (name === null || name.length < 4) return;
			// A doc comment on an exported declaration sits before the `export` keyword.
			const parent = node.parent;
			const owner = parent !== null && exportWrappers.has(parent.type) ? parent : node;
			const comments = context.sourceCode.getCommentsBefore(owner);
			const comment = comments[comments.length - 1];
			if (comment === undefined) return;
			if (repeatsName(comment.value, name, configuredMaxWords(context))) {
				context.report({ node: comment, messageId: "repeatedSymbolName", data: { name } });
			}
		};

		return {
			ClassDeclaration: check,
			FunctionDeclaration: check,
			MethodDefinition: check,
			PropertyDefinition: check,
			TSEnumDeclaration: check,
			TSInterfaceDeclaration: check,
			TSTypeAliasDeclaration: check,
			VariableDeclaration: check,
		};
	},
});
