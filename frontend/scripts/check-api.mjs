import { spawnSync } from "node:child_process";
import { rmSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = join(frontendRoot, "src/api/generated");
const checkDir = join(frontendRoot, "src/api/.generated-check");

const ARTIFACTS = ["api.ts", "api.types.d.ts", "api.client.ts"];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: frontendRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

try {
  rmSync(checkDir, { recursive: true, force: true });
  mkdirSync(checkDir, { recursive: true });

  run("npx", [
    "typed-openapi",
    "--config",
    "typed-openapi.config.ts",
    "--output",
    join(checkDir, "api.ts"),
  ]);

  let stale = false;
  for (const file of ARTIFACTS) {
    const committedPath = join(generatedDir, file);
    const checkPath = join(checkDir, file);

    if (!existsSync(committedPath) || !existsSync(checkPath)) {
      console.error(`Missing artifact: ${file}`);
      stale = true;
      continue;
    }

    const committed = readFileSync(committedPath);
    const freshlyGenerated = readFileSync(checkPath);
    if (!committed.equals(freshlyGenerated)) {
      console.error(`Out of date: src/api/generated/${file}`);
      stale = true;
    }
  }

  if (stale) {
    console.error("\nGenerated API artifacts are out of sync with contracts/openapi.yaml.");
    console.error("Run: npm run generate:api");
    process.exit(1);
  }

  console.log("Generated API artifacts are up to date.");
} finally {
  rmSync(checkDir, { recursive: true, force: true });
}
