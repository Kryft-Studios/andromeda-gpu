import MaterialDescriptor from ".";

export default function getBlendOptions(opts: MaterialDescriptor.BLEND_TARGET[]) {
    const prefFormat = navigator.gpu.getPreferredCanvasFormat()
    const targets: GPUColorTargetState[] = []
    for (let i = 0; i < opts.length; i++) {
        let item = opts[i];
        if ((item as any).writeMask) {
            targets.push(item as GPUColorTargetState)
        } else {
            item = item as MaterialDescriptor.INT_BLEND_TARGET
            const opt: Partial<GPUColorTargetState> = {}
            opt.format = item?.format === "default" || !item?.format ? prefFormat : item?.format
            opt.writeMask = GPUColorWrite[item.mask.toUpperCase() as keyof GPUColorWrite]
            if (item.state) {
                opt.blend = {
                    alpha: {},
                    color: {}
                }
                if (item.state.alpha) {
                    let alpha = {
                        dstFactor: undefined as string|undefined,
                        operation: item.state?.alpha?.operation,
                        srcFactor: undefined as string|undefined
                    }
                    const dest = item.state.alpha.destination
                    if(dest?.use)alpha.dstFactor = transformFromOperation(blendFactorLookup[dest?.use],dest.operation)
                    const src = item.state.alpha.source
                    if(src?.use)alpha.srcFactor = transformFromOperation(blendFactorLookup[src.use],src.operation);
                    opt.blend.alpha = alpha as GPUBlendComponent;
                }
                if(item.state.color){
                    let color = {
                        dstFactor: undefined as string|undefined,
                        operation:item.state.color.operation,
                        srcFactor:undefined as string|undefined
                    }
                    const dest = item.state.color.destination
                    if(dest?.use)color.dstFactor = transformFromOperation(blendFactorLookup[dest?.use],dest.operation)
                    const src = item.state.color.source
                    if(src?.use)color.srcFactor = transformFromOperation(blendFactorLookup[src.use],src.operation);
                    opt.blend.color =color as GPUBlendComponent;
                }
            }
        targets.push(opt as GPUColorTargetState)
        }
    }
    return targets;
}
function transformFromOperation(str:string,operation:"none"|"one-minus"|"saturate"="none"){
    if(operation==="none")return str;
    if(operation==="one-minus")return "one-minus-"+str;
    else return str+"-saturated"
}
const blendFactorLookup = (({
        "fragment-shader-alpha": "src-alpha",
        "zero": "zero",
        "one": "one",
        "blend-constant": "constant",
        "fragment-shader-full": "src",
        "previous-full": "dst",
        "previous-alpha": "dst-alpha"
}) as const)