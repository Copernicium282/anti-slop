import { eslintCompatPlugin } from "@oxlint/plugins";

import { noAiVocabularyRule } from "./rules/no-ai-vocabulary.ts";
import { noChatbotResidueRule } from "./rules/no-chatbot-residue.ts";
import { noChangelogCommentRule } from "./rules/no-changelog-comment.ts";
import { noCommentRepeatsSymbolNameRule } from "./rules/no-comment-repeats-symbol-name.ts";
import { noCopulaAvoidanceRule } from "./rules/no-copula-avoidance.ts";
import { noDashAsConnectorRule } from "./rules/no-dash-as-connector.ts";
import { noDecorativeFormattingRule } from "./rules/no-decorative-formatting.ts";
import { noForcedTriadRule } from "./rules/no-forced-triad.ts";
import { noHyphenatedPairRule } from "./rules/no-hyphenated-pair.ts";
import { noInflatedSignificanceRule } from "./rules/no-inflated-significance.ts";
import { noKnowledgeLimitDisclaimerRule } from "./rules/no-knowledge-limit-disclaimer.ts";
import { noNotButContrastRule } from "./rules/no-not-but-contrast.ts";
import { noOneLineCloserRule } from "./rules/no-one-line-closer.ts";
import { noPassiveVoiceRule } from "./rules/no-passive-voice.ts";
import { noPhilosophicalSayingRule } from "./rules/no-philosophical-saying.ts";
import { noRepeatedSentenceOpeningRule } from "./rules/no-repeated-sentence-opening.ts";
import { noSalesLanguageRule } from "./rules/no-sales-language.ts";
import { noShallowIngRiderRule } from "./rules/no-shallow-ing-rider.ts";
import { noSmartQuotesRule } from "./rules/no-smart-quotes.ts";
import { noStackedQualifierRule } from "./rules/no-stacked-qualifier.ts";
import { noStagedRunupRule } from "./rules/no-staged-runup.ts";
import { noUnraisedObjectionRule } from "./rules/no-unraised-objection.ts";
import { noVagueAssociationRule } from "./rules/no-vague-association.ts";

/**
 * Opt-in Oxlint rules that reject AI writing patterns in comments and documentation.
 *
 * The patterns come from the Humanizer skill (blader/humanizer), which is built on
 * Wikipedia's "Signs of AI writing". Rules read comments by default; pass
 * `{ "includeStrings": true }` to include prose-bearing string literals.
 */
const antiSlopProsePlugin = eslintCompatPlugin({
	meta: { name: "anti-slop-prose" },
	rules: {
		"no-ai-vocabulary": noAiVocabularyRule,
		"no-chatbot-residue": noChatbotResidueRule,
		"no-changelog-comment": noChangelogCommentRule,
		"no-comment-repeats-symbol-name": noCommentRepeatsSymbolNameRule,
		"no-copula-avoidance": noCopulaAvoidanceRule,
		"no-dash-as-connector": noDashAsConnectorRule,
		"no-decorative-formatting": noDecorativeFormattingRule,
		"no-forced-triad": noForcedTriadRule,
		"no-hyphenated-pair": noHyphenatedPairRule,
		"no-inflated-significance": noInflatedSignificanceRule,
		"no-knowledge-limit-disclaimer": noKnowledgeLimitDisclaimerRule,
		"no-not-but-contrast": noNotButContrastRule,
		"no-one-line-closer": noOneLineCloserRule,
		"no-passive-voice": noPassiveVoiceRule,
		"no-philosophical-saying": noPhilosophicalSayingRule,
		"no-repeated-sentence-opening": noRepeatedSentenceOpeningRule,
		"no-sales-language": noSalesLanguageRule,
		"no-shallow-ing-rider": noShallowIngRiderRule,
		"no-smart-quotes": noSmartQuotesRule,
		"no-stacked-qualifier": noStackedQualifierRule,
		"no-staged-runup": noStagedRunupRule,
		"no-unraised-objection": noUnraisedObjectionRule,
		"no-vague-association": noVagueAssociationRule,
	},
});

export default antiSlopProsePlugin;
