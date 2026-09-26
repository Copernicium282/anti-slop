/** Prose helpers shared by the humanizer-derived rules. */

/** Line-leading decoration: list bullets, headings, blockquote markers, emphasis. */
const lineDecoration = /^(?:[-*+>#]+\s*|\d+[.)]\s+|\u2022\s*)/gu;

/** Block comment decoration such as the leading `*` of a JSDoc line. */
const blockDecoration = /^\s*\*[ \t]?/gu;

/** Trailing sentence punctuation and closing quotes. */
const trailingPunctuation = /[.!?:;,)\]}"'\u2019\u201d]+$/gu;

const terminalPunctuation = /[.!?]["'\u2019\u201d)\]]*(?=\s|$)/u;

/** Remove comment and list decoration so sentence text can be matched directly. */
export function stripDecoration(line: string): string {
	return line.replaceAll(blockDecoration, "").replaceAll(lineDecoration, "").trim();
}

/** Lowercase word tokens, keeping intra-word hyphens and apostrophes. */
export function words(text: string): readonly string[] {
	return text
		.toLowerCase()
		.split(/[^\p{L}\p{N}'-]+/u)
		.flatMap((token) => (token.length > 0 ? [token] : []));
}

export function wordCount(text: string): number {
	return words(text).length;
}

/** Split prose into sentence-like units: one per line, then on terminal punctuation. */
export function splitSentences(text: string): readonly string[] {
	const sentences: string[] = [];
	for (const line of text.split(/\r?\n/u)) {
		const cleaned = stripDecoration(line);
		if (cleaned.length === 0) continue;
		let start = 0;
		for (const match of cleaned.matchAll(new RegExp(terminalPunctuation, "gu"))) {
			const end = (match.index ?? 0) + match[0].length;
			const sentence = cleaned.slice(start, end).trim();
			if (sentence.length > 0) sentences.push(sentence);
			start = end;
		}
		const rest = cleaned.slice(start).trim();
		if (rest.length > 0) sentences.push(rest);
	}
	return sentences;
}

/** First word of a sentence, lowercased and stripped of punctuation. */
export function openingWord(sentence: string): string | null {
	return words(sentence)[0] ?? null;
}

/** Sentence text without its terminal punctuation. */
export function withoutTerminalPunctuation(sentence: string): string {
	return sentence.replaceAll(trailingPunctuation, "");
}

/** A one-line closer is a short sentence that stands on its own. */
export function isShortSentence(sentence: string, maxWords: number): boolean {
	const text = withoutTerminalPunctuation(sentence);
	return wordCount(text) > 0 && wordCount(text) <= maxWords;
}

/** Trailing clause of a sentence, after the last comma or coordinating conjunction. */
export function trailingClause(sentence: string): string {
	const text = withoutTerminalPunctuation(sentence);
	const comma = text.lastIndexOf(",");
	const and = text.lastIndexOf(" and ");
	const start = Math.max(comma, and);
	return start === -1 ? text : text.slice(start + 1).trim();
}

/**
 * Split a three-item coordination such as "keynote sessions, panel discussions, and
 * networking opportunities" into its three items, or return `null`.
 */
export function coordinationItems(sentence: string): readonly string[] | null {
	const text = withoutTerminalPunctuation(sentence);
	const parts = text.split(",").map((part) => part.trim());
	if (parts.length !== 3) return null;
	const [first, second, third] = parts as [string, string, string];
	if (parts.some((part) => part.length === 0)) return null;
	const last = third.replace(/^(?:and|or|plus|&)\s+/iu, "");
	if (last === third) return null;
	return [first, second, last];
}
