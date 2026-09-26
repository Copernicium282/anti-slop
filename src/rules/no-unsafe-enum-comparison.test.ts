import { RuleTester } from "oxlint/plugins-dev";

import { noUnsafeEnumComparisonRule } from "./no-unsafe-enum-comparison.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "unsafeEnumComparison", data: { literal: "string" } };

tester.run("anti-slop/no-unsafe-enum-comparison", noUnsafeEnumComparisonRule, {
	valid: [
		"enum Direction { Up, Down }\nconst isUp = direction === Direction.Up;",
		'const matches = name === "up";',
		"const isSame = left === right;",
		'const overlaps = start < "2026-01-01";',
	],
	invalid: [
		{ code: 'enum Direction { Up = "up" }\nconst isUp = Direction.Up === "up";', errors: [error] },
		{ code: 'const matches = Level.Error !== "error";', errors: [error] },
	],
});
