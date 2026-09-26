import { RuleTester } from "oxlint/plugins-dev";

import { noChangelogCommentRule } from "./no-changelog-comment.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "changelogComment" };

tester.run("anti-slop-prose/no-changelog-comment", noChangelogCommentRule, {
	valid: [
		"// Hash lookups avoid the quadratic scan.",
		"/** Returns the value stored under the key. */",
		'const note = "The old value is replaced by the new one.";',
	],
	invalid: [
		{ code: "// This function was added to replace the previous quadratic approach.", errors: [error] },
		{ code: "// In previous versions this returned a string.", errors: [error] },
		{ code: "// The old implementation used a linear scan.", errors: [error] },
	],
});
