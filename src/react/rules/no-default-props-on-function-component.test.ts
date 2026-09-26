import { RuleTester } from "oxlint/plugins-dev";

import { noDefaultPropsOnFunctionComponentRule } from "./no-default-props-on-function-component.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "defaultPropsOnFunctionComponent" };

tester.run("anti-slop-react/no-default-props-on-function-component", noDefaultPropsOnFunctionComponentRule, {
	valid: [
		'function Heading({ text = "Hello" }: { text?: string }) { return <h1>{text}</h1>; }',
		"class Panel { static defaultProps = { id: \"1\" }; }",
		"const config = { defaultProps: { retries: 3 } };",
	],
	invalid: [
		{
			code: "function Heading() { return <h1>Hi</h1>; }\nHeading.defaultProps = { text: \"Hello\" };",
			errors: [error],
		},
		{
			code: "const Heading = () => <h1>Hi</h1>;\nHeading.defaultProps = { text: \"Hello\" };",
			errors: [error],
		},
	],
});
