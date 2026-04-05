process.exit(0)
import { createMinifier } from 'dts-minify';
import * as ts from 'typescript';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const minifier = createMinifier(ts);
const distDir = './dist';
let totalReduction = 0;
async function processFile(inputPath) {
    try {
        const rawTypes = readFileSync(inputPath, 'utf8');
        
        let minified = minifier.minify(rawTypes, {
            keepJsDocs: false, 
        });

        minified = minified
            .replace(/\r?\n\s*/g, ';')  // Replace Newline + Indentation with ;
            .replace(/\s+/g, ' ')       // Collapse multiple spaces
            .replace(/;;+/g, ';')       // Fix double semicolons
            .replace(/;}/g, '}')        // Remove ; before }
            .replace(/;{/g, '{')        // Remove ; before {
            .replace(/:\s+/g, ':')      // Remove space after colon
            .replace(/\s*=>\s*/g, '=>') // Remove space around arrows
            .replace(/,\s+/g, ',')      // Remove space after commas
            .replace(/; /g, ';')        // Remove trailing spaces after new semicolons
            .trim();

        writeFileSync(inputPath, minified);
        
        const originalSize = (rawTypes.length / 1024).toFixed(2);
        const newSize = (minified.length / 1024).toFixed(2);
        
        console.log(`[.D.TS (DTS-MINIFY)] [✓] Minified:  ${inputPath} -${totalReduction+=originalSize-newSize}KB`);

    } catch (err) {
        console.error(`[X] Error in ${inputPath}:`, err.message);
    }
}

async function walkDir(dir) {
    if (!existsSync(dir)) return; 
    
    const files = readdirSync(dir);
    for (const file of files) {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
            await walkDir(fullPath); 
        } else if (fullPath.endsWith('.d.ts')) {
            await processFile(fullPath); 
        }
    }
}

console.log("Starting minification");
if (existsSync(distDir)) {
    walkDir(distDir).then(() => {
        console.log("\nMinification complete! Total Reduction: "+totalReduction+"KB");
        writeFileSync("./data/a",totalReduction.toString())
    }).catch(err => {
        console.error("Error:", err);
    });
} else {
    console.error(`[X] Error: ${distDir} folder not found. Run 'pnpm tsc' first!`);
}
