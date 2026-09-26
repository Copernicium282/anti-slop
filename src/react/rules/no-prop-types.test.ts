import { RuleTester } from "oxlint/plugins-dev";

import { noPropTypesRule } from "./no-prop-types.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const definition = { messageId: "propTypesDefinition" };
const importError = { messageId: "propTypesImport" };

tester.run("anti-slop-react/no-prop-types", noPropTypesRule, {
	valid: [
		"interface Props { id: string }\nfunction Heading({ id }: Props) { return <h1>{id}</h1>; }",
		"const props = { propTypes: \"metadata\" };",
	],
	invalid: [
		{ code: 'import PropTypes from "prop-types";', errors: [importError] },
		{
			code: 'import { string } from "prop-types";\nconst check = string;',
			errors: [importError],
		},
		{
			code: "function Heading() { return <h1>Hi</h1>; }\nHeading.propTypes = { text: String };",
			errors: [definition],
		},
		{
			code: "class Panel { static propTypes = { id: String }; }",
			errors: [definition],
		},
	],
});
