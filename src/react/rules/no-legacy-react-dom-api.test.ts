import { RuleTester } from "oxlint/plugins-dev";

import { noLegacyReactDomApiRule } from "./no-legacy-react-dom-api.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string) => ({ messageId: "removedReactDomExport", data: { name } });
const moduleError = (module: string, replacement: string) => ({
	messageId: "removedModule",
	data: { module, replacement },
});

tester.run("anti-slop-react/no-legacy-react-dom-api", noLegacyReactDomApiRule, {
	valid: [
		'import { createRoot } from "react-dom/client";\ncreateRoot(document.body);',
		'import { createPortal } from "react-dom";\ncreatePortal(null, document.body);',
		'const render = (node: unknown) => node;\nrender(null);',
	],
	invalid: [
		{ code: 'import { render } from "react-dom";\nrender(null, document.body);', errors: [error("render")] },
		{
			code: 'import ReactDOM from "react-dom";\nReactDOM.render(null, document.body);',
			errors: [error("render")],
		},
		{
			code: 'import { findDOMNode } from "react-dom";\nfindDOMNode(node);',
			errors: [error("findDOMNode")],
		},
		{
			code: 'import { act } from "react-dom/test-utils";',
			errors: [
				moduleError(
					"react-dom/test-utils",
					"import `act` from `react`; the other helpers were removed",
				),
			],
		},
		{
			code: 'import TestRenderer from "react-test-renderer";',
			errors: [
				moduleError(
					"react-test-renderer",
					"use `@testing-library/react`, which renders like a user does",
				),
			],
		},
	],
});
