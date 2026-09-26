import { RuleTester } from "oxlint/plugins-dev";

import { noCommentRepeatsSymbolNameRule } from "./no-comment-repeats-symbol-name.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (name: string) => ({ messageId: "repeatedSymbolName", data: { name } });

tester.run("anti-slop-prose/no-comment-repeats-symbol-name", noCommentRepeatsSymbolNameRule, {
	valid: [
		"/** Loads the configuration from disk on first use. */\nfunction loadConfig() {\n\treturn null;\n}",
		"/** Parses the input value into a record. */\nfunction parseInput() {\n\treturn null;\n}",
		"// Remove the entry from the index.\nfunction pruneIndex() {\n\treturn null;\n}",
	],
	invalid: [
		{
			code: "/** Load the config. */\nfunction loadConfig() {\n\treturn null;\n}",
			errors: [error("loadConfig")],
		},
		{ code: "// User id.\nexport const userId = loadId();", errors: [error("userId")] },
		{
			code: "/** Parse the header. */\nexport function parseHeader() {\n\treturn null;\n}",
			errors: [error("parseHeader")],
		},
	],
});
