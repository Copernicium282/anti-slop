import { RuleTester } from "oxlint/plugins-dev";

import { noChatbotResidueRule } from "./no-chatbot-residue.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "chatbotResidue", data: { phrases } });

tester.run("anti-slop-prose/no-chatbot-residue", noChatbotResidueRule, {
	valid: [
		"// The retry budget is per request.",
		"/** Notifies the caller when the queue drains. */",
		'const hint = "The token expires after an hour.";',
	],
	invalid: [
		{
			code: "// I hope this helps! Let me know if you need more.",
			errors: [error("I hope this helps, let me know")],
		},
		{ code: "// Great question! Here is an overview of retries.", errors: [error("great question, here is a")] },
		{ code: "// Certainly! Would you like me to expand on that?", errors: [error("certainly!, would you like")] },
	],
});
