import { RuleTester } from "oxlint/plugins-dev";

import { noDeprecatedFormEventRule } from "./no-deprecated-form-event.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string) => ({ messageId: "deprecatedFormEvent", data: { name } });

tester.run("anti-slop-react/no-deprecated-form-event", noDeprecatedFormEventRule, {
	valid: [
		'import type { FormEventHandler as InputChange } from "react";\ntype A = InputChange<HTMLInputElement>;',
		"type B = React.ChangeEvent<HTMLInputElement>;",
		"type C = SyntheticEvent<HTMLFormElement>;",
		"const formEvent = \"FormEvent\";",
	],
	invalid: [
		{
			code: 'import type { FormEvent } from "react";\ntype A = FormEvent<HTMLFormElement>;',
			errors: [error("FormEvent")],
		},
		{
			code: 'import type { FormEventHandler } from "react";\ntype B = FormEventHandler<HTMLFormElement>;',
			errors: [error("FormEventHandler")],
		},
		{ code: "type C = React.FormEvent<HTMLFormElement>;", errors: [error("FormEvent")] },
		{
			code: 'import { type FormEvent } from "react";\nfunction use(form: FormEvent) { return form; }',
			errors: [error("FormEvent")],
		},
	],
});
