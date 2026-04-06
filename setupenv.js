#!/usr/bin/env node

import { exec, execSync } from "node:child_process";
import { exists, existsSync, read, readdirSync } from "node:fs";
import { chdir } from "node:process";
import { promisify } from "node:util";
import readline from "node:readline/promises";
import { platform } from "node:os";
const originalDir = process.cwd()
function err(message) {
    const RED_BG = "\x1b[41m";
    const WHITE_TEXT = "\x1b[37m";
    const BOLD = "\x1b[1m";
    const RESET = "\x1b[0m";
    console.error(`\n${RED_BG}${WHITE_TEXT}${BOLD} ERROR ${RESET} ${message}\n`);
    process.exit(1);
}

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
})

const run =async function(message){await promisify(exec)(message,{stdio:"ignore"})}
console.log("Checking for pnpm...")
await run("pnpm -v").catch(async err=>{
    const res = await rl.question("It seems pnpm is not installed. would you like to install pnpm? [y/n]: ")
    if(res===""||res==="y") {
        console.log("Installing pnpm..")
        await run("npm -v").catch(err=>{
            err("Could not find npm.")
        })
        await run("npm i pnpm")
    } else {
        err("Please install pnpm and try again.")
    }
})
/*
console.log("Checking for rust...")
await run("cargo -v").catch(async e=>{
    const res = await rl.question("It seems that rust is not installed. Install rust? [y/n]: ")
    if(res==="y"||res===""){
        console.log("\nInstalling Rust..")
        if(platform()==="win32"){
            execSync("winget install Rust.Rustup",{stdio:"ignore"})
            console.log("Open/reset terminal to continue.")
            process.exit(0)
        } else {
            await run("sudo apt update").catch(e=>{
                err("could not figure out how to install rust. you may install it manually.")
            })
            execSync("sudo apt install rustc cargo -y",{stdio:"ignore"})
        }
    }else{err("Rust was not installed")}
})
await run("wasm-pack help").catch(async e=>{
    const res = await rl.question("wasm-pack seems to be not installed. install wasm-pack?")
    if(res==="y"||res===""){
        execSync("cargo install wasm-pack",{"stdio":"ignore"})
    } else {
        err("Install wasm-pack and try again")
    }
})
await run("clang -v").catch(async e=>{
    const res = await rl.question("It seems that clang is not installed. Install clang? [y/n]: ")
    if(res==="y"||res==""){
        if(platform()==="win32"){
            execSync("winget install LLVM.LLVM")
            console.log("Open/reset terminal to continue")
            process.exit(0)
        } else {
            await run("sudo apt update").catch(e=>{
                err("could not figure out how to install clang. you may install it manually.")
            })
            execSync("sudo apt install clang lldb lld -y")
        }
    }else{
        err("Please install clang and try again.")
    }
})
*/
async function progress(percent, message) {
    const size = 20; 
    const filledSize = Math.round((size * percent) / 100);
    const bar = "█".repeat(filledSize) + "░".repeat(size - filledSize);
    
    process.stdout.write(`\r\x1b[2K\x1b[36m[${bar}]\x1b[0m ${percent}% - ${message}`);
    await new Promise((resolve)=>{
        setTimeout(()=>resolve(),50)
    })
}
chdir(originalDir)
console.log("Finding directories...")
let folders = readdirSync("./packages",{recursive:false,withFileTypes:true})
folders=folders.filter(a=>{
    console.log(`Checking ${a.name}`)
    if(a.isFile())return false;
    if(a.name.endsWith("template"))return false;
    return true;
});
chdir("./packages/template")
await progress(20,"Installing modules...")
for(let i = 0; i<folders.length;i++){
    const item = folders[i]
    console.log("Setting up "+item.name)
    chdir("../"+item.name);
    execSync("pnpm i",{stdio:"inherit"})
    /*if(existsSync("./src/webassembly")){
        chdir("./src/webassembly")
        execSync("wasm-pack build --target web",{stdio:"ignore"})
        chdir("../../")
    }*/
}

await progress(100,"Complete!")