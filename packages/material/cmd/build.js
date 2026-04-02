import { exec as execCallback, execSync } from "node:child_process";
import { promisify } from "node:util";
import process from "node:process";

const exec = promisify(execCallback);

async function build() {
    try {
        console.log("[✓] Starting build...");

        await exec("pnpm lint").catch(err => {
            console.error("[X] LINTING FAILED\n", err.stdout || err.stderr);
            process.exit(1);
        });

        await exec("tsc").catch(err => {
            console.error("[X] COMPILATION FAILED\n", err.stdout || err.stderr);
            process.exit(1);
        });

        console.log("[✓] Minifying...");
        execSync("pnpm minify:js && pnpm minify:dts && pnpm minify:end", { stdio: 'inherit' });

        console.log("[✓] Successfully compiled and minified!");
        process.exit(0);

    } catch (error) {
        console.error("[X] Unexpected Build Error:", error);
        process.exit(1);
    }
}

build();