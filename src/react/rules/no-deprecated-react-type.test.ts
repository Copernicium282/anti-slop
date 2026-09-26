import { RuleTester } from "oxlint/plugins-dev";

import { noDeprecatedReactTypeRule } from "./no-deprecated-react-type.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string) => ({ messageId: "deprecatedReactType", data: { name } });

tester.run("anti-slop-react/no-deprecated-react-type", noDeprecatedReactTypeRule, {
	valid: [
		'import type { MutableRef } from "react";\ntype A = MutableRef<string>;',
		"type B = React.RefObject<HTMLDivElement>;",
		"const fragment = \"PropsWithRef\";",
	],
	invalid: [
		{
			code: 'import type { MutableRefObject } from "react";\ntype A = MutableRefObject<string>;',
			errors: [error("MutableRefObject")],
		},
		{ code: "type B = React.LegacyRef<HTMLDivElement>;", errors: [error("LegacyRef")] },
		{
			code: 'import type { ReactFragment, ReactText } from "react";\ntype C = ReactFragment | ReactText;',
			errors: [error("ReactFragment"), error("ReactText")],
		},
		{ code: "type D = React.VoidFunctionComponent<{ id: string }>;", errors: [error("VoidFunctionComponent")] },
	],
});
