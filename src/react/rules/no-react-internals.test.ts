import { RuleTester } from "oxlint/plugins-dev";

import { noReactInternalsRule } from "./no-react-internals.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = (name: string) => ({ messageId: "reactInternals", data: { name } });

tester.run("anti-slop-react/no-react-internals", noReactInternalsRule, {
	valid: [
		'import { useState } from "react";\nconst [value, setValue] = useState(0);',
		"const internals = { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: 1 };",
	],
	invalid: [
		{
			code: 'import React from "react";\nconst internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;',
			errors: [error("__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED")],
		},
		{
			code: 'import { __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE } from "react";',
			errors: [error("__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE")],
		},
		{ code: "const dispatcher = ReactCurrentDispatcher.current;", errors: [error("ReactCurrentDispatcher")] },
	],
});
