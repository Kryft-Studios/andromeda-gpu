// Bind Group + other stuff
// const regex = /@group\(([\d]+)\)[\s\n]*@binding\(([\d]+)\)[\s\n]*var(?:<([A-Za-z]+)>)?[\s\n]*([A-Za-z0-9_]+)[\s\n]*:[\s\n]*([A-Za-z0-9_<>\s\n]+);/g;
const regex = /@group\(([\d]+)\)/g

/**
 * Extracts bind-group indices referenced by WGSL source.
 */
export default function getBindGroups(code: string): Set<Readonly<number>> {
    const matches = [...code.matchAll(regex)].map(a => Number(a[1]));
    return new Set(matches) as Set<Readonly<number>>;
}

