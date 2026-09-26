import { eslintCompatPlugin } from "@oxlint/plugins";

import { noArrayIndexKeyRule } from "./rules/no-array-index-key.ts";
import { noDefaultPropsOnFunctionComponentRule } from "./rules/no-default-props-on-function-component.ts";
import { noDeprecatedEventPropertyRule } from "./rules/no-deprecated-event-property.ts";
import { noDeprecatedFormEventRule } from "./rules/no-deprecated-form-event.ts";
import { noDeprecatedJsxAttributeRule } from "./rules/no-deprecated-jsx-attribute.ts";
import { noDeprecatedReactTypeRule } from "./rules/no-deprecated-react-type.ts";
import { noForwardRefRule } from "./rules/no-forward-ref.ts";
import { noGlobalJsxNamespaceRule } from "./rules/no-global-jsx-namespace.ts";
import { noImplicitRefCallbackReturnRule } from "./rules/no-implicit-ref-callback-return.ts";
import { noLegacyClassLifecycleRule } from "./rules/no-legacy-class-lifecycle.ts";
import { noLegacyContextRule } from "./rules/no-legacy-context.ts";
import { noLegacyReactDomApiRule } from "./rules/no-legacy-react-dom-api.ts";
import { noNestedComponentRule } from "./rules/no-nested-component.ts";
import { noPropTypesRule } from "./rules/no-prop-types.ts";
import { noReactInternalsRule } from "./rules/no-react-internals.ts";
import { noStringRefsRule } from "./rules/no-string-refs.ts";
import { noUseReducerTypeArgumentRule } from "./rules/no-use-reducer-type-argument.ts";
import { noUseRefWithoutArgumentRule } from "./rules/no-use-ref-without-argument.ts";

/**
 * Opt-in Oxlint rules for React 19 conventions.
 *
 * The deprecations come from the React 19 upgrade guide and the `@deprecated` tags in
 * `@types/react`. Rules that need a module to be sure of an API's origin check the
 * import, so a same-named local helper stays valid.
 */
const antiSlopReactPlugin = eslintCompatPlugin({
	meta: { name: "anti-slop-react" },
	rules: {
		"no-array-index-key": noArrayIndexKeyRule,
		"no-default-props-on-function-component": noDefaultPropsOnFunctionComponentRule,
		"no-deprecated-event-property": noDeprecatedEventPropertyRule,
		"no-deprecated-form-event": noDeprecatedFormEventRule,
		"no-deprecated-jsx-attribute": noDeprecatedJsxAttributeRule,
		"no-deprecated-react-type": noDeprecatedReactTypeRule,
		"no-forward-ref": noForwardRefRule,
		"no-global-jsx-namespace": noGlobalJsxNamespaceRule,
		"no-implicit-ref-callback-return": noImplicitRefCallbackReturnRule,
		"no-legacy-class-lifecycle": noLegacyClassLifecycleRule,
		"no-legacy-context": noLegacyContextRule,
		"no-legacy-react-dom-api": noLegacyReactDomApiRule,
		"no-nested-component": noNestedComponentRule,
		"no-prop-types": noPropTypesRule,
		"no-react-internals": noReactInternalsRule,
		"no-string-refs": noStringRefsRule,
		"no-use-reducer-type-argument": noUseReducerTypeArgumentRule,
		"no-use-ref-without-argument": noUseRefWithoutArgumentRule,
	},
});

export default antiSlopReactPlugin;
