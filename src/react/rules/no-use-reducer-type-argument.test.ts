import { RuleTester } from "oxlint/plugins-dev";

import { noUseReducerTypeArgumentRule } from "./no-use-reducer-type-argument.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "useReducerTypeArgument" };

tester.run("anti-slop-react/no-use-reducer-type-argument", noUseReducerTypeArgumentRule, {
	valid: [
		'import { useReducer } from "react";\nconst [state, dispatch] = useReducer(reducer, initial);',
		'import { useReducer } from "react";\nconst [state] = useReducer<State, [Action]>(reducer, initial);',
		"const useReducer = (reducer: unknown) => reducer;",
	],
	invalid: [
		{
			code: 'import { useReducer } from "react";\nconst [state] = useReducer<React.Reducer<State, Action>>(reducer);',
			errors: [error],
		},
		{
			code: 'import { useReducer as reduce } from "react";\nconst [state] = reduce<Reducer<State, Action>>(reducer, initial);',
			errors: [error],
		},
	],
});
