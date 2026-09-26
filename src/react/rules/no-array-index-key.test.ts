import { RuleTester } from "oxlint/plugins-dev";

import { noArrayIndexKeyRule } from "./no-array-index-key.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string) => ({ messageId: "arrayIndexKey", data: { name } });

tester.run("anti-slop-react/no-array-index-key", noArrayIndexKeyRule, {
	valid: [
		"const rows = items.map(item => <Row key={item.id} item={item} />);",
		"const rows = items.map((item, index) => <Row key={`row-${index}`} />);",
		"const value = { key: index };",
	],
	invalid: [
		{
			code: "const rows = items.map((item, index) => <Row key={index} item={item} />);",
			errors: [error("index")],
		},
		{
			code: "const rows = items.map((item, i) => <Row key={i} />);",
			errors: [error("i")],
		},
	],
});
