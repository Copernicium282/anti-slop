import { RuleTester } from "oxlint/plugins-dev";

import { noJsonCloneRoundTripRule } from "./no-json-clone-round-trip.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "jsonCloneRoundTrip" };

tester.run("anti-slop/no-json-clone-round-trip", noJsonCloneRoundTripRule, {
	valid: [
		"const encoded = JSON.stringify(value);",
		"const decoded = JSON.parse(encoded);",
		"const copy = structuredClone(value);",
		// A local `JSON` binding is the target's own codec, not the global one.
		"const JSON = codec;\nconst copy = JSON.parse(JSON.stringify(value));",
	],
	invalid: [
		{ code: "const copy = JSON.parse(JSON.stringify(value));", errors: [error] },
		{ code: "store(JSON.parse(JSON.stringify(state)));", errors: [error] },
	],
});
