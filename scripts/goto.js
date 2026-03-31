/*#!/usr/bin/env node
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const optionLookup = {
    "a3d": "@andromeda-3d",
    "agl": "@andromeda-gl",
    "agpu": "@andromeda-gpu",
};

const typeLookup = {
    "pkg": "./packages",
    "dev": "./dev"
};

function err(message) {
    const RED_BG = "\x1b[41m";
    const WHITE_TEXT = "\x1b[37m";
    const RESET = "\x1b[0m";
    console.error(`\n${RED_BG}${WHITE_TEXT} ERROR ${RESET} ${message}\n`);
    process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP_PATH = path.join(__dirname, 'tmp');

const options = Object.keys(optionLookup);
const input = await rl.question(`Enter package (e.g., a3d/core): `);
const [prefix, pkgName] = input.split("/");

if (!options.includes(prefix) || !pkgName) err("Invalid package format! Use [a3d|agl|agpu]/name");

const type = await rl.question(`Enter mode [dev|pkg]: `);
if (!typeLookup[type]) err("Invalid mode! Use 'dev' or 'pkg'");

const dir = path.resolve(process.cwd(), typeLookup[type], optionLookup[prefix], pkgName);

if (!existsSync(dir)) err(`Path doesn't exist: ${dir}`);

writeFileSync(TMP_PATH, dir);
rl.close();
process.exit(0);
*/