#!/usr/bin/env node
// RUN THIS WITH NODE TO CREATE A NEW PACKAGE
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFile, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
const command = process.argv.slice(2)
const commandName = command[0]
function err(message) {
    const RED_BG = "\x1b[41m";
    const WHITE_TEXT = "\x1b[37m";
    const BOLD = "\x1b[1m";
    const RESET = "\x1b[0m";
    console.error(`\n${RED_BG}${WHITE_TEXT}${BOLD} ERROR ${RESET} ${message}\n`);
    process.exit(1);
}
if(!["create"].includes(command[0]))err("Invalid command name")
if(commandName==="create"){
const commandArgs = command.slice(1)
const rl = readline.createInterface({
    input:process.stdin,
    output: process.stdout
})

function slugify(folderName) {
    return folderName
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')        
        .replace(/[^\w\-]+/g, '')        
        .replace(/\-\-+/g, '-')            
        .replace(/^-+/, '')         
        .replace(/-+$/, '');            
}

async function progress(percent, message) {
    const size = 20; 
    const filledSize = Math.round((size * percent) / 100);
    const bar = "█".repeat(filledSize) + "░".repeat(size - filledSize);
    
    process.stdout.write(`\r\x1b[2K\x1b[36m[${bar}]\x1b[0m ${percent}% - ${message}`);
    await new Promise((resolve)=>{
        setTimeout(()=>resolve(),50)
    })
}
console.log(`
------------------------
AGPU PACKAGE CREATION CLI
------------------------
`)
const orgName = "."
const orgFolder = orgName
let name = commandArgs[0] ? commandArgs[0]: await rl.question(`Enter package name: `)
name = slugify(name)
if(readdirSync(orgFolder,{recursive:false}).includes(name)){
    err(`${orgName}/${name} already exists`)
}
let version = commandArgs[1]?commandArgs[1]:await rl.question(`Enter starting version [number.number.number]: `)
if(!version.match(/[\d]+\.[\d]+\.[\d]+/))err("Invalid version")
console.log("\n")
await progress(10,"Starting...")
const fullName = `@agpu/${name}`
const packagePath = name
await progress(20,"Copying templates...")
const minifyDts = readFileSync("./template/minify-dts.js")
const minifyEnd = readFileSync("./template/minify-end.js")
const minifyJS = readFileSync("./template/minify-js.js")
const tsConfig = readFileSync("./template/tsconfig")
await progress(30,"Copying templates...")
const eslintConfig = readFileSync("./template/eslint.config")
const gitIgnore = readFileSync("./template/.gitignore")
const npmIgnore = readFileSync("./template/.npmignore")
const build = readFileSync("./template/build.js")
await progress(40,"Creating package folder...")
mkdirSync(packagePath)
await progress(50,"Entering package folder...")
process.chdir(packagePath);
await progress(60,"Pasting .gitignore template")
writeFileSync("./.gitignore",gitIgnore)
writeFileSync("./.npmignore",npmIgnore)
await progress(70,"Installing packages...")
execSync("pnpm add -D eslint typescript terser node dts-minify @typescript-eslint/parser @typescript-eslint/eslint-plugin")
await progress(80,"Configurating...")
execSync(`pnpm pkg set name="${fullName}"`)
execSync(`pnpm pkg set version="${version}"`)
execSync(`pnpm pkg set scripts.minify:js="node minify-js.js"`)
execSync(`pnpm pkg set scripts.minify:dts="node minify-dts.js"`)
execSync(`pnpm pkg set scripts.minify:end="node minify-end.js"`)
execSync(`pnpm pkg set scripts.tsc="tsc"`)
execSync(`pnpm pkg set scripts.lint="eslint"`)
execSync(`pnpm pkg set scripts.build="node build.js"`)
execSync(`pnpm pkg set private=false`)
execSync(`pnpm pkg set publishConfig.access="public"`)
await progress(90,"Pasting templates...")
writeFileSync("./minify-dts.js",minifyDts)
writeFileSync("./minify-js.js",minifyJS)
writeFileSync("./minify-end.js",minifyEnd)
writeFileSync("./eslint.config.js",eslintConfig)
writeFileSync("./tsconfig.json",tsConfig)
writeFileSync("./README.md", `# ${fullName}
## Installation
\`\`\`bash
pnpm add ${fullName}
\`\`\`

## Usage
`)
mkdirSync("./src")
writeFileSync("./src/index.ts", `export const hello = () => {
  console.log("Hello from ${fullName}");
};
`)
await progress(100,"Complete!")
mkdirSync("./cmd")
mkdirSync("./data")
writeFileSync("./cmd/build.js",build)
let createAdjacentDevFolder = commandArgs[2] ? commandArgs[2] : await rl.question("Create a folder for this package in dev/? [y|n]")
console.log("\n")
if(createAdjacentDevFolder===""||createAdjacentDevFolder==="y"){
    await progress(10,"Starting...")
    process.chdir(`../../dev/${orgName}`)
    await progress(20,"Creating directory")
    mkdirSync(`./${name}`)
    await progress(30,"Creating with vite")
    execSync(`pnpm create vite ${name} --template vanilla --yes`, { stdio: 'ignore' });
    await progress(50,"Writing templates")
    process.chdir("./"+name)
    writeFileSync("./index.html",`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`)
writeFileSync("./src/main.js",`
console.log("Hello World!")`)
    await progress(70,"Installing node modules")
    execSync("pnpm i")
    await progress(90,"Deleting files that are not needed")
rmSync("./src/counter.js",{"force":true})
rmSync("./src/assets",{recursive:true,"force":true})
rmSync("./public",{recursive:true,"force":true})
    await progress(100,"Complete!")
}
rl.close()
} 
process.exit(0)