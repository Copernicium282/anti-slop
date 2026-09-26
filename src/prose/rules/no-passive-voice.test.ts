import { RuleTester } from "oxlint/plugins-dev";

import { noPassiveVoiceRule } from "./no-passive-voice.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (sentence: string) => ({ messageId: "passiveVoice", data: { sentence } });

tester.run("anti-slop-prose/no-passive-voice", noPassiveVoiceRule, {
	valid: [
		"// The parser validates the header and rejects unknown fields.",
		"/** Rotates the token in place. */",
	],
	invalid: [
		{ code: "// The results are preserved automatically.", errors: [error("The results are preserved automatically.")] },
		{ code: "// No configuration file needed.", errors: [error("No configuration file needed.")] },
		{ code: "// The queue was drained by the scheduler.", errors: [error("The queue was drained by the scheduler.")] },
	],
});
