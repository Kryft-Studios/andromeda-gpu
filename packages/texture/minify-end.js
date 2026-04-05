import {readFileSync} from "fs"
const res= Number(readFileSync("./data/a").toString())+Number(readFileSync("./data/b").toString())
console.log("[✓] Total Saved: "+res+"KB")