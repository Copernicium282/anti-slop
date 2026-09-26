// Run every RuleTester suite. Suites are discovered so a new rule's test cannot be
// forgotten in package.json.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src");
const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");

/** The CLI suite spawns `pnpm`, which needs a real executable on PATH, so it is opt-in. */
const optIn = new Set(["require-readable-spacing-cli.test.ts"]);

function suites(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return suites(path);
		return entry.name.endsWith(".test.ts") ? [path] : [];
	});
}

const all = suites(source).sort();
const skipped = [];
let failures = 0;

for (const path of all) {
	const name = relative(root, path);
	if (optIn.has(path.split("\\").pop() ?? "") && !process.env.ANTI_SLOP_CLI_TESTS) {
		skipped.push(name);
		continue;
	}
	const result = spawnSync(process.execPath, [tsxCli, path], { stdio: "inherit" });
	if (result.status !== 0) {
		failures += 1;
		console.error(`FAIL ${name}`);
	}
}

if (!existsSync(source)) throw new Error(`missing source directory: ${source}`);
console.log(`${all.length - skipped.length} suites passed, ${failures} failed.`);
if (skipped.length > 0) {
	console.log(`Skipped ${skipped.length} CLI suite(s): ${skipped.join(", ")}`);
	console.log("Set ANTI_SLOP_CLI_TESTS=1 to run them.");
}
process.exit(failures === 0 ? 0 : 1);
