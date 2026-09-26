import { RuleTester } from "oxlint/plugins-dev";

import { noAiVocabularyRule } from "./no-ai-vocabulary.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "aiVocabulary", data: { phrases } });

tester.run("anti-slop-prose/no-ai-vocabulary", noAiVocabularyRule, {
	valid: [
		"// The parser is robust against truncated frames.",
		"// Actually the cache never expires.",
		"/** Returns the retry policy for a request. */",
	],
	invalid: [
		{ code: "// A delve into the intricate tapestry of the module.", errors: [error("delve, intricate, tapestry")] },
		{
			code: "// This robust showcase underscores the vibrant landscape.",
			errors: [error("landscape, robust, showcase, underscore, vibrant")],
		},
		{
			code: "// A testament to the meticulous curation of the landing page.",
			errors: [error("meticulous, testament")],
		},
		{
			code: 'const blurb = "A pivotal showcase of the new pipeline.";',
			options: [{ includeStrings: true }],
			errors: [error("pivotal, showcase")],
		},
	],
});
