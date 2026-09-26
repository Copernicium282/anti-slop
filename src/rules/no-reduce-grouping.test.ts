import { RuleTester } from "oxlint/plugins-dev";

import { noReduceGroupingRule } from "./no-reduce-grouping.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "reduceGrouping" };

tester.run("anti-slop/no-reduce-grouping", noReduceGroupingRule, {
	valid: [
		"const total = items.reduce((sum, item) => sum + item.price, 0);",
		'const byOwner = Object.groupBy(items, item => item.owner);',
		"const count = items.reduce((acc, item) => { acc[item.id] = (acc[item.id] ?? 0) + 1; return acc; }, {});",
	],
	invalid: [
		{
			code: "const byOwner = items.reduce((groups, item) => {\n\tconst key = item.owner;\n\tgroups.set(key, [...(groups.get(key) ?? []), item]);\n\treturn groups;\n}, new Map());",
			errors: [error],
		},
		{
			code: "const byKind = rows.reduce((groups, row) => {\n\tgroups[groups[rows.kind] = []].push(row);\n\treturn groups;\n}, {});",
			errors: [error],
		},
	],
});
