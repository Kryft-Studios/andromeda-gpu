import __wbg_init from "./webassembly/pkg/webassembly";

export default async function init(){
    await __wbg_init();
    return;
}