import { RuleTester } from "oxlint/plugins-dev";

import { noUseRefWithoutArgumentRule } from "./no-use-ref-without-argument.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "useRefWithoutArgument" };

tester.run("anti-slop-react/no-use-ref-without-argument", noUseRefWithoutArgumentRule, {
	valid: [
		'import { useRef } from "react";\nconst ref = useRef<HTMLDivElement | null>(null);',
		"const useRef = () => ({ current: null });\nuseRef();",
	],
	invalid: [
		{ code: 'import { useRef } from "react";\nconst ref = useRef();', errors: [error] },
		{
			code: 'import { useRef as ref } from "react";\nconst node = ref();',
			errors: [error],
		},
	],
});
