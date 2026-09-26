import { RuleTester } from "oxlint/plugins-dev";

import { noNestedComponentRule } from "./no-nested-component.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string) => ({ messageId: "nestedComponent", data: { name } });

tester.run("anti-slop-react/no-nested-component", noNestedComponentRule, {
	valid: [
		"function Row() { return <tr />; }\nfunction Table() { return <Row />; }",
		"function Table() { const renderRow = () => <tr />; return renderRow(); }",
	],
	invalid: [
		{
			code: "function Table() { function Row() { return <tr />; } return <Row />; }",
			errors: [error("Row")],
		},
		{
			code: "function Table() { const Row = () => <tr />; return <Row />; }",
			errors: [error("Row")],
		},
	],
});
