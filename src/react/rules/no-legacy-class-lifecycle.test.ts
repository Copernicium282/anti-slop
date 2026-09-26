import { RuleTester } from "oxlint/plugins-dev";

import { noLegacyClassLifecycleRule } from "./no-legacy-class-lifecycle.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string, replacement: string) => ({
	messageId: "legacyLifecycle",
	data: { name, replacement },
});

tester.run("anti-slop-react/no-legacy-class-lifecycle", noLegacyClassLifecycleRule, {
	valid: [
		"class Panel { componentDidMount() {} componentWillUnmount() {} }",
		"const willUpdate = { componentWillUpdate: 1 };",
	],
	invalid: [
		{
			code: "class Panel { componentWillMount() {} }",
			errors: [
				error("componentWillMount", "move the work into the constructor or `componentDidMount`"),
			],
		},
		{
			code: "class Panel { componentWillReceiveProps(next: unknown) { return next; } }",
			errors: [
				error(
					"componentWillReceiveProps",
					"derive the value during render or in `getDerivedStateFromProps`",
				),
			],
		},
		{
			code: "class Panel { UNSAFE_componentWillUpdate() {} }",
			errors: [
				error(
					"UNSAFE_componentWillUpdate",
					"use `getSnapshotBeforeUpdate` or move the work into an effect",
				),
			],
		},
	],
});
