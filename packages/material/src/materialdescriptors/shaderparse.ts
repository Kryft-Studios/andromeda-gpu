
const glmreg = /@[\s\n]*location[\s\n]*\([\n\s]*([\d]+)[\n\s]*\)[\n\s]*([\w]+)[\n\s]*\:[\n\s]*([\w\<\>]+)/g
export function getLocationsMetadata(code: string) {
    const match = [...code.matchAll(glmreg)];
    let a = []
    for (let i = 0; i < match.length; i++) {
        const item = match[i]
        a.push({
            location: Number(item[1]),
            type: item[3] as GPUVertexFormat,
        })
    }
    return a;
}
// ----------- //@SPACE?group(SPACE?NUMSPACE?)SPACE?@SPACE?bindingSPACE?(SPACE?NUMSPACE?)SPACE?var[<SPACE?WORD[,WORD]?SPACE?>]?SPACE?WORDSPACE?:SPACE?WORD
const gbregex = /@[\s\n]*group\([\s\n]*([\d]+)[\s\n]*\)[\s\n]*@[\s\n]*binding[\s\n]*\([\s\n]*([\d]+)[\s\n]*\)[\s\n]*var[\<[\s\n]*([\w\d]+)([,[\w\d]+]*)[\s\n]*\>]?[\s\n]*([\w\d]+)[\s\n]*:[\s\n]*([\w\d\<\>]+)/g
export function getGBMetadata(code: string) {
    const match = [...code.matchAll(gbregex)]
    let a = []
    for (let i = 0; i < match.length; i++) {
        const item = match[i]
        a.push({
            group: Number(item[1]),
            binding: Number(item[2]),
            type: item[6] as `vec${2|3|4}${"f"|"h"|"i"|"u"}`
        })
    }
    return a;
}