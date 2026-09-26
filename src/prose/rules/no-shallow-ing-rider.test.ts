import { RuleTester } from "oxlint/plugins-dev";

import { noShallowIngRiderRule } from "./no-shallow-ing-rider.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = (sentence: string) => ({ messageId: "shallowIngRider", data: { sentence } });

tester.run("anti-slop-prose/no-shallow-ing-rider", noShallowIngRiderRule, {
	valid: [
		"// The loader ensures that the file exists before reading it.",
		"/** Returns the parsed header. */",
		"// Roger Ebert highlighted the lasting influence of the film.",
	],
	invalid: [
		{
			code: "// The palette is painted blue and gold, symbolizing Texas bluebonnets.",
			errors: [error("symbolizing Texas bluebonnets")],
		},
		{
			code: "// The index groups rows by owner, showcasing the newest change.",
			errors: [error("showcasing the newest change")],
		},
	],
});
