import { RuleTester } from "oxlint/plugins-dev";

import { noLegacyHasOwnPropertyRule } from "./no-legacy-has-own-property.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "legacyHasOwnProperty" };

tester.run("anti-slop/no-legacy-has-own-property", noLegacyHasOwnPropertyRule, {
	valid: [
		'const hasId = Object.hasOwn(record, "id");',
		"const hasId = Object.prototype.hasOwn.call(other, key);",
		"const flag = record.hasOwnProperty === undefined;",
		// A local `Object` is the target's own namespace, not the global built-in.
		"const Object = Model;\nconst hasId = Object.prototype.hasOwnProperty.call(record, key);",
	],
	invalid: [
		{ code: 'const hasId = Object.prototype.hasOwnProperty.call(record, "id");', errors: [error] },
		{ code: 'const hasId = record.hasOwnProperty("id");', errors: [error] },
	],
});
