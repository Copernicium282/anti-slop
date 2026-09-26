import { RuleTester } from "oxlint/plugins-dev";

import { noVagueAssociationRule } from "./no-vague-association.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (phrases: string) => ({ messageId: "vagueAssociation", data: { phrases } });

tester.run("anti-slop-prose/no-vague-association", noVagueAssociationRule, {
	valid: [
		"// The parser reads the header length from the first four bytes.",
		"/** Sends the frame to the socket. */",
		'const detail = "The writer flushes before it returns.";',
	],
	invalid: [
		{ code: "// He is associated with the Rajhans Orchestra.", errors: [error("associated with")] },
		{
			code: "// The concerts were organised in connection with the anniversary.",
			errors: [error("in connection with")],
		},
		{ code: "// The retry policy is linked to the queue depth.", errors: [error("linked to")] },
	],
});
