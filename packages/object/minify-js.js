import { minify } from 'terser';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
const distDir = './dist';
let totalReduction = 0;
async function processDir(dir) {
    const files = readdirSync(dir);
    for (const file of files) {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
            await processDir(fullPath);
        } else if (extname(fullPath) === '.js') {
            const code = readFileSync(fullPath, 'utf8');
            const minified = await minify(code, {
    compress: {
        ecma: 2022,
        passes: 3,
        unsafe: true,
        pure_getters: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        hoist_funs: true,
        toplevel: true,
    },
    mangle: {
        toplevel: true,
    },
    format: {
        comments: /^\s*\/\*\*/i, 
    }
});
            if (minified.code) {
                const bytesSaved = code.length - minified.code.length;
                totalReduction += bytesSaved;

                const savedKB = (bytesSaved / 1024).toFixed(2);

                writeFileSync(fullPath, minified.code);

                console.log(`[.JS (TERSER)] [✓] Minified ${fullPath} -${savedKB}KB`);
            }
        }
    }
}

console.log("[✓] Minifying...");
processDir(distDir).catch(console.error).then(() => {
    const totalKB = (totalReduction / 1024).toFixed(2);
    console.log("[✓] Minification complete! Total Reduction: " + totalKB + "KB")
    writeFileSync("./data/b", totalKB)
});