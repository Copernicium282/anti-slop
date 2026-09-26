import { defineRule } from "@oxlint/plugins";

import { proseCommentSegments, proseScope, proseStringSegment, type ProseSegment } from "./segments.ts";

import type { Context, DiagnosticData, Rule, RuleOptionsSchema, Visitor } from "@oxlint/plugins";

/** Report either a slice of the segment text or the whole segment node. */
export type ProseReport = (
	where?: { readonly offset: number; readonly length: number },
	data?: DiagnosticData,
) => void;

function reporter(context: Context, segment: ProseSegment, messageId: string): ProseReport {
	return (where, data) => {
		context.report({
			messageId,
			...(where === undefined ? { node: segment.node } : { loc: segment.locAt(where.offset, where.length) }),
			// `data` must stay its own key; spreading it would skip placeholder interpolation.
			...(data === undefined ? {} : { data }),
		});
	};
}

/** Wire comment and string surfaces into the rule's own inspection callback. */
export function proseVisitors(
	context: Context,
	messageId: string,
	inspect: (segment: ProseSegment, report: ProseReport) => void,
): Visitor {
	return {
		Program() {
			// Options are bound after `createOnce`, so read them per file, not per rule.
			for (const segment of proseCommentSegments(context)) {
				inspect(segment, reporter(context, segment, messageId));
			}
		},
		Literal(node) {
			if (!proseScope(context).includeStrings) return;
			const segment = proseStringSegment(context, node);
			if (segment === null) return;
			inspect(segment, reporter(context, segment, messageId));
		},
	};
}

/** A phrase a humanizer pattern watches for. */
export type ProsePhrase = {
	/** Stable name used in diagnostics rather than a raw pattern dump. */
	readonly label: string;
	readonly pattern: RegExp;
};

export type ProsePhraseRuleDefinition = {
	readonly description: string;
	readonly messageId: string;
	/** Message template; interpolates `{{phrases}}` with the triggers found. */
	readonly message: string;
	/** Tells that justify a report on a single sighting. */
	readonly strong?: readonly ProsePhrase[];
	/** Tells that only count when the same passage stacks several of them. */
	readonly weak?: readonly ProsePhrase[];
	/** Distinct triggers required in one passage. Defaults to 1, or 2 for weak-only rules. */
	readonly minDistinct?: number;
	/** Expose `{ extra: [...] }` so a repository can extend the weak list. */
	readonly extendable?: boolean;
};

type ProsePhraseHit = {
	readonly label: string;
	readonly offset: number;
	readonly length: number;
};

function hitsFor(segment: ProseSegment, phrases: readonly ProsePhrase[]): readonly ProsePhraseHit[] {
	const hits: ProsePhraseHit[] = [];
	const seen = new Set<string>();
	for (const { label, pattern } of phrases) {
		const match = pattern.exec(segment.raw);
		if (match === null || seen.has(label)) continue;
		seen.add(label);
		hits.push({ label, offset: match.index, length: match[0].length });
	}
	return hits;
}

function phraseSchema(extendable: boolean): RuleOptionsSchema {
	return [
		{
			type: "object",
			properties: {
				includeStrings: { type: "boolean" },
				...(extendable
					? { extra: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1 } }
					: {}),
			},
			additionalProperties: false,
		},
	];
}

function escapeRegExp(value: string): string {
	return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
}

function extraPhrases(context: Context): readonly ProsePhrase[] {
	const option = context.options?.[0];
	if (typeof option !== "object" || option === null || Array.isArray(option)) return [];
	const values = (option as Record<string, unknown>).extra;
	if (!Array.isArray(values)) return [];
	return values.flatMap((value) =>
		typeof value === "string" && value.trim().length > 0
			? [
					{
						label: value.trim(),
						pattern: new RegExp(String.raw`\b${escapeRegExp(value.trim())}\b`, "iu"),
					},
				]
			: [],
	);
}

/**
 * Build a rule that reports humanizer phrase lists found in prose.
 *
 * Strong tells report on a single sighting. Weak tells follow the skill's guidance
 * and only report when the same passage stacks several of them.
 */
export function defineProsePhraseRule(definition: ProsePhraseRuleDefinition): Rule {
	const strong = definition.strong ?? [];
	const weak = definition.weak ?? [];
	const minDistinct = definition.minDistinct ?? (strong.length > 0 ? 1 : 2);

	return defineRule({
		meta: {
			// Oxlint only surfaces `problem` diagnostics, so prose findings report as problems.
			type: "problem",
			docs: { description: definition.description },
			messages: { [definition.messageId]: definition.message },
			schema: phraseSchema(definition.extendable === true),
			defaultOptions: [{ includeStrings: false }],
		},
		createOnce(context) {
			return proseVisitors(context, definition.messageId, (segment, report) => {
				const strongHits = hitsFor(segment, strong);
				const weakHits: readonly ProsePhraseHit[] = [
					...hitsFor(segment, weak),
					...hitsFor(segment, extraPhrases(context)),
				];
				const hits: readonly ProsePhraseHit[] = [...strongHits, ...weakHits];
				const distinct = [...new Set(hits.map((hit) => hit.label))];
				// A passage with only weak tells needs company, whatever `minDistinct` says.
				const required = strongHits.length > 0 ? 1 : Math.max(minDistinct, 2);
				if (distinct.length < required) return;
				const first = hits[0];
				if (first === undefined) return;
				report({ offset: first.offset, length: first.length }, { phrases: distinct.join(", ") });
			});
		},
	});
}
