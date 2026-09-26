import { RuleTester } from "oxlint/plugins-dev";

import { noForcedTriadRule } from "./no-forced-triad.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (sentence: string) => ({ messageId: "forcedTriad", data: { sentence } });

tester.run("anti-slop-prose/no-forced-triad", noForcedTriadRule, {
	valid: [
		"// The event includes talks, panels, and a long hallway track.",
		"/** Returns the parsed header. */",
	],
	invalid: [
		{
			code: "// The event features keynote sessions, panel discussions, and networking opportunities.",
			errors: [
				error("The event features keynote sessions, panel discussions, and networking opportunities."),
			],
		},
		{
			code: "// Attendees can expect innovation, inspiration, and insights.",
			errors: [error("Attendees can expect innovation, inspiration, and insights.")],
		},
	],
});
