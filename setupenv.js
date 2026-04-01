#!/usr/bin/env node

import { exec, execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { chdir } from "node:process";
async function progress(percent, message) {
    const size = 20; 
    const filledSize = Math.round((size * percent) / 100);
    const bar = "█".repeat(filledSize) + "░".repeat(size - filledSize);
    
    process.stdout.write(`\r\x1b[2K\x1b[36m[${bar}]\x1b[0m ${percent}% - ${message}`);
    await new Promise((resolve)=>{
        setTimeout(()=>resolve(),50)
    })
}
function err(message) {
    const RED_BG = "\x1b[41m";
    const WHITE_TEXT = "\x1b[37m";
    const BOLD = "\x1b[1m";
    const RESET = "\x1b[0m";
    console.error(`\n${RED_BG}${WHITE_TEXT}${BOLD} ERROR ${RESET} ${message}\n`);
    process.exit(1);
}
const folders = readdirSync("../packages",{recursive:false,withFileTypes:true})
folders=folders.filter(a=>{
    if(a.isFile())return false;
    if(a.name==="template")return false;
    return true;
});
await progress(10,"Starting up")
chdir("../packages/template")
await progress(20,"Installing modules...")
for(let i = 0; i<folders.length;i++){
    chdir("../")
    const item = folders[i]
    chdir(item.name);
    execSync("pnpm i")
}
//await progress(50,"Installing emsdk...")
//chdir("../../compilers/emsdk")
//execSync("emsdk install latest")
//execSync("emsdk activate latest --permanent")
//execSync("emsdk_env.bat")
await progress(100,"Complete!")