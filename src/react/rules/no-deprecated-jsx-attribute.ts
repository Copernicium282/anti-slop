import { defineRule } from "@oxlint/plugins";

import { jsxAttributeName } from "../shared/jsx.ts";

import type { Rule } from "@oxlint/plugins";

/** JSX attributes `@types/react` marks `@deprecated`. */
const deprecatedAttributes = new Map([
	["aria-dropeffect", "it was deprecated in ARIA 1.1; expose the drag result through the drop handler instead"],
	["aria-grabbed", "it was deprecated in ARIA 1.1; use `aria-pressed` or the drag events instead"],
	["charSet", "React wants the lowercase `charset` attribute name"],
	["frameBorder", "use the `frameBorder` CSS property through `style`"],
	["marginHeight", "use the `margin` CSS property through `style`"],
	["marginWidth", "use the `margin` CSS property through `style`"],
	["onKeyPress", "use `onKeyDown`, which fires for every key the browser delivers"],
	["onKeyPressCapture", "use `onKeyDownCapture` instead"],
]);

/** Disallow JSX attributes that React or ARIA deprecated. */
export const noDeprecatedJsxAttributeRule: Rule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow deprecated JSX attributes (`onKeyPress`, `aria-grabbed`, `aria-dropeffect`, `charSet`, `frameBorder`, `marginWidth`, `marginHeight`).",
		},
		messages: {
			deprecatedJsxAttribute:
				"`{{name}}` is deprecated: {{replacement}}.",
		},
	},
	createOnce(context) {
		return {
			JSXAttribute(node) {
				const name = jsxAttributeName(node);
				if (name === null) return;
				const replacement = deprecatedAttributes.get(name);
				if (replacement === undefined) return;
				context.report({
					node,
					messageId: "deprecatedJsxAttribute",
					data: { name, replacement },
				});
			},
		};
	},
});
