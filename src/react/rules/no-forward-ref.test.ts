import { RuleTester } from "oxlint/plugins-dev";

import { noForwardRefRule } from "./no-forward-ref.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "forwardRef" };

tester.run("anti-slop-react/no-forward-ref", noForwardRefRule, {
	valid: [
		'function Input({ ref }: { ref?: React.Ref<HTMLInputElement> }) { return <input ref={ref} />; }',
		"const forwardRef = (render: unknown) => render;",
	],
	invalid: [
		{
			code: 'import { forwardRef } from "react";\nconst Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} />);',
			errors: [error],
		},
		{
			code: 'import React, { forwardRef as fr } from "react";\nconst Input = fr((props, ref) => null);',
			errors: [error],
		},
	],
});
